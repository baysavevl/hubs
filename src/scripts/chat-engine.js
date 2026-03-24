/**
 * Google Ads Solutions Architect — Client-side Chat Engine
 *
 * Uses multi-signal scoring: phrase matching, TF-IDF weighting,
 * question similarity, and answer content search.
 */

export class ChatEngine {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;

    this.stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
      'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
      'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and',
      'or', 'if', 'while', 'about', 'up', 'what', 'which', 'who', 'whom',
      'this', 'that', 'these', 'those', 'am', 'it', 'its', 'i', 'me', 'my',
      'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them', 'his', 'her',
    ]);

    // Build IDF (inverse document frequency) for all tokens across KB
    this.idf = this._buildIdf();

    // Pre-process entries for fast matching
    this.entries = this.kb.map(entry => ({
      raw: entry,
      // Full text of question, lowercased
      questionLower: entry.question.toLowerCase(),
      // Keywords as multi-word phrases, lowercased
      keywordPhrases: entry.keywords.map(k => k.toLowerCase()),
      // Single-word tokens from keywords
      keywordTokens: new Set(
        entry.keywords.flatMap(k => this.tokenize(k))
      ),
      // Tokens from question
      questionTokens: new Set(this.tokenize(entry.question)),
      // Tokens from answer (for content search)
      answerTokens: new Set(this.tokenize(entry.answer)),
      // Full answer lowercased for phrase search
      answerLower: entry.answer.toLowerCase(),
    }));
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !this.stopWords.has(w));
  }

  _buildIdf() {
    const docCount = this.kb.length;
    const termDocs = {};

    for (const entry of this.kb) {
      const allText = `${entry.question} ${entry.keywords.join(' ')} ${entry.answer}`;
      const tokens = new Set(this.tokenize(allText));
      for (const t of tokens) {
        termDocs[t] = (termDocs[t] || 0) + 1;
      }
    }

    const idf = {};
    for (const [term, count] of Object.entries(termDocs)) {
      idf[term] = Math.log(docCount / (count + 1)) + 1;
    }
    return idf;
  }

  _getIdf(token) {
    return this.idf[token] || 5; // Unknown terms get high weight (specific = valuable)
  }

  score(queryText, queryTokens, entry) {
    let score = 0;
    const queryLower = queryText.toLowerCase();

    // ── Signal 1: Full phrase matching against keywords (highest value) ──
    // If the user's query contains a multi-word keyword phrase exactly, huge boost
    for (const phrase of entry.keywordPhrases) {
      if (phrase.length > 3 && queryLower.includes(phrase)) {
        // Longer phrases are more specific = more valuable
        score += phrase.split(/\s+/).length * 15;
      }
    }

    // ── Signal 2: Question similarity (semantic match) ──
    // Compare query tokens to question tokens with IDF weighting
    let questionMatchScore = 0;
    let questionMatchCount = 0;
    for (const token of queryTokens) {
      if (entry.questionTokens.has(token)) {
        questionMatchScore += this._getIdf(token) * 3;
        questionMatchCount++;
      }
    }
    // Bonus for high overlap ratio
    if (entry.questionTokens.size > 0) {
      const overlapRatio = questionMatchCount / Math.max(queryTokens.length, 1);
      questionMatchScore *= (1 + overlapRatio);
    }
    score += questionMatchScore;

    // ── Signal 3: Keyword token matching with IDF ──
    let kwMatchCount = 0;
    for (const token of queryTokens) {
      if (entry.keywordTokens.has(token)) {
        score += this._getIdf(token) * 2;
        kwMatchCount++;
      }
    }
    // Multi-keyword match bonus
    if (kwMatchCount >= 2) {
      score += kwMatchCount * 4;
    }

    // ── Signal 4: Answer content search (lower weight, for coverage) ──
    for (const token of queryTokens) {
      if (entry.answerTokens.has(token) && !entry.questionTokens.has(token) && !entry.keywordTokens.has(token)) {
        score += this._getIdf(token) * 0.5;
      }
    }

    // ── Signal 5: Query-question string similarity ──
    // Jaccard-like similarity between question and query
    if (entry.questionTokens.size > 0 && queryTokens.length > 0) {
      const intersection = queryTokens.filter(t => entry.questionTokens.has(t)).length;
      const union = new Set([...queryTokens, ...entry.questionTokens]).size;
      const jaccard = intersection / union;
      if (jaccard > 0.3) {
        score += jaccard * 20;
      }
    }

    // ── Penalty: Suppress overly generic matches ──
    // If the only matching tokens are ultra-common ones (google, ads, campaign), discount
    const matchedTokens = queryTokens.filter(t => entry.keywordTokens.has(t) || entry.questionTokens.has(t));
    const genericTokens = new Set(['google', 'ads', 'campaign', 'campaigns', 'ad', 'advertising']);
    const allGeneric = matchedTokens.length > 0 && matchedTokens.every(t => genericTokens.has(t));
    if (allGeneric && matchedTokens.length <= 2) {
      score *= 0.3;
    }

    return score;
  }

  getResponse(query) {
    const tokens = this.tokenize(query);

    if (tokens.length === 0) {
      return {
        answer: "I'd be happy to help! Try asking about **Google Ads setup**, **campaign types**, **bidding strategies**, **keyword research**, or **optimization tips**.",
        links: [{ text: "Browse the Knowledge Base", url: "/google-mindful-solution-architect/projects/google-ads/" }],
        category: "general",
      };
    }

    const scored = this.entries
      .map(entry => ({ entry: entry.raw, score: this.score(query, tokens, entry) }))
      .filter(s => s.score > 2)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return {
        answer: "I don't have a specific answer for that yet. Try rephrasing with specific Google Ads terms, or browse our guides directly.",
        links: [{ text: "Complete Guide", url: "/google-mindful-solution-architect/projects/google-ads/" }, { text: "Knowledge Library", url: "/google-mindful-solution-architect/projects/knowledge-library/" }],
        category: "fallback",
      };
    }

    const best = scored[0].entry;
    // For related, pick from different categories to offer diverse suggestions
    const related = scored
      .slice(1, 8)
      .filter(s => s.entry.category !== best.category)
      .slice(0, 2);
    // If not enough cross-category, fill from same category
    if (related.length < 2) {
      const more = scored.slice(1, 5).filter(s => !related.some(r => r.entry.id === s.entry.id));
      while (related.length < 2 && more.length > 0) {
        related.push(more.shift());
      }
    }

    return {
      answer: best.answer,
      links: best.links || [],
      category: best.category,
      related: related.map(r => ({ question: r.entry.question, id: r.entry.id })),
    };
  }
}
