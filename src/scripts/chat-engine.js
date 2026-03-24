/**
 * Google Ads Solutions Architect — Client-side Chat Engine
 *
 * Intent detection + multi-signal scoring + follow-up questions.
 */

export class ChatEngine {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
    this.lastQuery = null;
    this.lastIntent = null;

    this.stopWords = new Set([
      'a','an','the','is','are','was','were','be','been','being',
      'have','has','had','do','does','did','will','would','could',
      'should','may','might','can','shall','to','of','in','for',
      'on','with','at','by','from','as','into','through','during',
      'before','after','above','below','between','out','off','over',
      'under','again','further','then','once','here','there','when',
      'where','why','how','all','each','every','both','few','more',
      'most','other','some','such','no','nor','not','only','own',
      'same','so','than','too','very','just','because','but','and',
      'or','if','while','about','up','what','which','who','whom',
      'this','that','these','those','am','it','its','i','me','my',
      'we','our','you','your','he','she','they','them','his','her',
    ]);

    // Intent patterns — ordered by priority
    this.intents = [
      { name: 'setup', patterns: ['set up','setup','create','start','first','begin','launch','new account','get started','how to start','configure','install','implement'], categoryBoost: ['setup-guide','getting-started','tracking','help-center'], categoryPenalty: ['success-stories','case-study'] },
      { name: 'troubleshoot', patterns: ['fix','error','not working','problem','issue','broken','wrong','failed','disapproved','suspended','dropped','why my','debug','diagnose'], categoryBoost: ['troubleshooting','troubleshooting-guide'], categoryPenalty: ['success-stories','case-study'] },
      { name: 'optimize', patterns: ['improve','optimize','increase','reduce','lower','boost','better','enhance','scale','grow'], categoryBoost: ['optimization','best-practices','advanced'], categoryPenalty: ['success-stories'] },
      { name: 'compare', patterns: ['vs','versus','compare','comparison','difference','or','better'], categoryBoost: ['business-strategy','campaign-types'], categoryPenalty: [] },
      { name: 'casestudy', patterns: ['case study','success story','example','who used','tell me about','how did','company'], categoryBoost: ['success-stories','case-study'], categoryPenalty: ['setup-guide','getting-started'] },
      { name: 'strategy', patterns: ['strategy','plan','budget','allocat','when to','should i','recommend','best practice','approach'], categoryBoost: ['business-strategy','best-practices','bidding'], categoryPenalty: [] },
      { name: 'technical', patterns: ['api','script','tag manager','gtm','bigquery','server side','tracking code','pixel','data feed','merchant center'], categoryBoost: ['technical','automation','ga4','help-center'], categoryPenalty: ['success-stories'] },
      { name: 'industry', patterns: ['saas','ecommerce','e-commerce','real estate','healthcare','legal','finance','restaurant','travel','education','automotive','app','b2b','b2c'], categoryBoost: ['industry','industry-problems'], categoryPenalty: [] },
      { name: 'country', patterns: ['vietnam','thailand','indonesia','malaysia','philippines','singapore','sea','southeast asia'], categoryBoost: ['setup-guide','success-stories'], categoryPenalty: [] },
    ];

    this.idf = this._buildIdf();

    this.entries = this.kb.map(entry => ({
      raw: entry,
      questionLower: entry.question.toLowerCase(),
      keywordPhrases: entry.keywords.map(k => k.toLowerCase()),
      keywordTokens: new Set(entry.keywords.flatMap(k => this.tokenize(k))),
      questionTokens: new Set(this.tokenize(entry.question)),
      answerTokens: new Set(this.tokenize(entry.answer)),
      answerLower: entry.answer.toLowerCase(),
    }));
  }

  tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w => w.length > 1 && !this.stopWords.has(w));
  }

  _buildIdf() {
    const n = this.kb.length, td = {};
    for (const e of this.kb) {
      const t = new Set(this.tokenize(`${e.question} ${e.keywords.join(' ')} ${e.answer}`));
      for (const w of t) td[w] = (td[w] || 0) + 1;
    }
    const idf = {};
    for (const [w, c] of Object.entries(td)) idf[w] = Math.log(n / (c + 1)) + 1;
    return idf;
  }

  _idf(t) { return this.idf[t] || 5; }

  // Detect intent from query
  _detectIntent(queryLower) {
    const matched = [];
    for (const intent of this.intents) {
      let strength = 0;
      for (const p of intent.patterns) {
        if (queryLower.includes(p)) strength += p.split(/\s+/).length;
      }
      if (strength > 0) matched.push({ ...intent, strength });
    }
    matched.sort((a, b) => b.strength - a.strength);
    return matched;
  }

  // Check if query has conflicting intents (e.g., "setup" + "vietnam" could be setup-in-vietnam OR case-study-from-vietnam)
  _isAmbiguous(intents, queryTokens) {
    if (intents.length < 2) return false;
    // If top two intents are setup+country or troubleshoot+country, not ambiguous — it's clearly "setup in [country]"
    const names = intents.slice(0, 2).map(i => i.name);
    if (names.includes('setup') && names.includes('country')) return false;
    if (names.includes('troubleshoot') && names.includes('country')) return false;
    if (names.includes('optimize') && names.includes('country')) return false;
    // If top intent is very strong vs second, not ambiguous
    if (intents[0].strength >= intents[1].strength * 2) return false;
    return intents[0].strength === intents[1].strength;
  }

  score(queryText, queryTokens, entry, intentBoosts, intentPenalties) {
    let score = 0;
    const queryLower = queryText.toLowerCase();

    // Phrase matching
    for (const phrase of entry.keywordPhrases) {
      if (phrase.length > 3 && queryLower.includes(phrase)) {
        score += phrase.split(/\s+/).length * 15;
      }
    }

    // Question similarity with IDF
    let qScore = 0, qCount = 0;
    for (const t of queryTokens) {
      if (entry.questionTokens.has(t)) { qScore += this._idf(t) * 3; qCount++; }
    }
    if (entry.questionTokens.size > 0) qScore *= (1 + qCount / Math.max(queryTokens.length, 1));
    score += qScore;

    // Keyword matching
    let kwCount = 0;
    for (const t of queryTokens) {
      if (entry.keywordTokens.has(t)) { score += this._idf(t) * 2; kwCount++; }
    }
    if (kwCount >= 2) score += kwCount * 4;

    // Answer content (low weight)
    for (const t of queryTokens) {
      if (entry.answerTokens.has(t) && !entry.questionTokens.has(t) && !entry.keywordTokens.has(t)) {
        score += this._idf(t) * 0.5;
      }
    }

    // Jaccard similarity
    if (entry.questionTokens.size > 0 && queryTokens.length > 0) {
      const inter = queryTokens.filter(t => entry.questionTokens.has(t)).length;
      const union = new Set([...queryTokens, ...entry.questionTokens]).size;
      const j = inter / union;
      if (j > 0.3) score += j * 20;
    }

    // Generic penalty
    const matched = queryTokens.filter(t => entry.keywordTokens.has(t) || entry.questionTokens.has(t));
    const generic = new Set(['google','ads','campaign','campaigns','ad','advertising']);
    if (matched.length > 0 && matched.every(t => generic.has(t)) && matched.length <= 2) score *= 0.3;

    // ── Intent-based category boost/penalty ──
    const cat = entry.raw.category;
    if (intentBoosts.has(cat)) score *= 1.8;
    if (intentPenalties.has(cat)) score *= 0.3;

    return score;
  }

  getResponse(query) {
    const tokens = this.tokenize(query);
    const queryLower = query.toLowerCase();

    if (tokens.length === 0) {
      return {
        answer: "I'd be happy to help! Try asking about **Google Ads setup**, **campaign types**, **bidding strategies**, or **optimization tips**.",
        links: [{ text: "Complete Guide", url: "/google-mindful-solution-architect/projects/google-ads/" }],
        category: "general",
      };
    }

    // Detect intent
    const intents = this._detectIntent(queryLower);
    const boosts = new Set();
    const penalties = new Set();

    if (intents.length > 0) {
      // Apply top intent's boosts/penalties
      const top = intents[0];
      top.categoryBoost.forEach(c => boosts.add(c));
      top.categoryPenalty.forEach(c => penalties.add(c));

      // If second intent is also strong (e.g., setup + country), combine boosts
      if (intents.length > 1 && intents[1].strength >= intents[0].strength * 0.5) {
        intents[1].categoryBoost.forEach(c => boosts.add(c));
        // Don't combine penalties — only top intent's penalties
      }
    }

    this.lastQuery = query;
    this.lastIntent = intents[0]?.name || null;

    const scored = this.entries
      .map(entry => ({ entry: entry.raw, score: this.score(query, tokens, entry, boosts, penalties) }))
      .filter(s => s.score > 2)
      .sort((a, b) => b.score - a.score);

    // If best score is too low, offer clarification
    if (scored.length === 0 || scored[0].score < 8) {
      // Generate a clarifying question based on detected intents
      if (intents.length >= 2 && this._isAmbiguous(intents, tokens)) {
        const options = intents.slice(0, 2).map(i => {
          switch(i.name) {
            case 'setup': return 'setting up Google Ads';
            case 'casestudy': return 'success stories and case studies';
            case 'troubleshoot': return 'troubleshooting an issue';
            case 'optimize': return 'optimizing campaigns';
            case 'strategy': return 'advertising strategy';
            case 'technical': return 'technical implementation';
            case 'industry': return 'industry-specific advice';
            case 'country': return 'advertising in a specific country';
            default: return i.name;
          }
        });
        return {
          answer: `I want to give you the best answer. Are you asking about **${options[0]}** or **${options[1]}**? You can also rephrase your question with more detail.`,
          links: [],
          category: "clarification",
          related: intents.slice(0, 2).map(i => ({
            question: `I need help with ${i.name === 'setup' ? 'setting up Google Ads' : i.name === 'casestudy' ? 'case studies' : i.name}`,
            id: 'clarify-' + i.name,
          })),
        };
      }

      if (scored.length === 0) {
        return {
          answer: "I don't have a specific answer for that yet. Could you try rephrasing? For example, specify if you need help with **setup**, **optimization**, **troubleshooting**, or **a specific industry**.",
          links: [{ text: "Complete Guide", url: "/google-mindful-solution-architect/projects/google-ads/" }, { text: "Knowledge Library", url: "/google-mindful-solution-architect/projects/knowledge-library/" }],
          category: "fallback",
        };
      }
    }

    const best = scored[0].entry;

    // Pick related from different categories
    const related = [];
    const seen = new Set([best.id]);
    for (const s of scored.slice(1, 10)) {
      if (!seen.has(s.entry.id) && (related.length === 0 || s.entry.category !== best.category)) {
        related.push(s);
        seen.add(s.entry.id);
      }
      if (related.length >= 2) break;
    }
    if (related.length < 2) {
      for (const s of scored.slice(1, 6)) {
        if (!seen.has(s.entry.id)) { related.push(s); seen.add(s.entry.id); }
        if (related.length >= 2) break;
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
