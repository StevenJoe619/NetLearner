/**
 * exam-engine.js — 考试状态机
 *
 * 无状态设计，所有状态由调用方维护。
 * 提供：答题、导航、标记、判分。
 */

class ExamEngine {
  constructor(cfg) {
    this.qs = cfg.questions || [];
    this.mode = cfg.mode || 'mock-exam';
    this.timeLimit = cfg.timeLimit || 0;  // 分钟
    this.allowBack = cfg.allowBack !== undefined ? cfg.allowBack : true;

    this._idx = 0;
    this._ans = {};    // { qId: 'A' }
    this._marked = {}; // { qId: true }
    this._remaining = this.timeLimit * 60;
    this._start = null;
    this._status = 'pending';
    this._result = null;
    this._timer = null;
  }

  start() {
    if (this._status !== 'pending') return;
    this._status = 'in_progress';
    this._start = Date.now();
    this._idx = 0;
    if (this.timeLimit > 0) {
      this._timer = setInterval(() => {
        this._remaining--;
        if (this._remaining <= 0) { this.submit(); }
      }, 1000);
    }
    return this.current();
  }

  current() {
    return {
      q: this.qs[this._idx] || null,
      idx: this._idx,
      total: this.qs.length,
      answered: Object.keys(this._ans).length
    };
  }

  answer(qId, opt) { if (this._status === 'in_progress') this._ans[qId] = opt; }

  /** 多选 toggle：在已有答案中增/删一个选项 */
  toggleChoice(qId, opt) {
    if (this._status !== 'in_progress') return;
    let cur = this._ans[qId] || '';
    const parts = cur ? cur.split(',').filter(Boolean) : [];
    const idx = parts.indexOf(opt);
    if (idx >= 0) parts.splice(idx, 1); else parts.push(opt);
    this._ans[qId] = parts.sort().join(',');
  }

  /** 判断一道题的答案是否正确（支持多题型） */
  _isCorrect(q, ua) {
    if (!ua) return false;
    const t = q.type || 'single';
    if (t === 'single' || t === 'drag') return ua === q.answer;
    if (t === 'multiple') {
      const aParts = (q.answer || '').split(',').filter(Boolean).sort().join(',');
      const uParts = ua.split(',').filter(Boolean).sort().join(',');
      return aParts === uParts;
    }
    if (t === 'fill') return ua.trim().toLowerCase() === (q.answer || '').trim().toLowerCase();
    return ua === q.answer;
  }

  go(dir) {
    if (this._status !== 'in_progress') return null;
    const t = dir === 'next' ? this._idx + 1 : this._idx - 1;
    if (t < 0 || t >= this.qs.length) return null;
    if (dir === 'prev' && !this.allowBack) return null;
    this._idx = t;
    return this.current();
  }

  jump(i) {
    if (this._status !== 'in_progress' || i < 0 || i >= this.qs.length) return null;
    this._idx = i;
    return this.current();
  }

  toggleMark(qId) {
    if (this._marked[qId]) { delete this._marked[qId]; return false; }
    this._marked[qId] = true; return true;
  }

  isMarked(qId) { return !!this._marked[qId]; }

  getAns(qId) { return this._ans[qId] || null; }

  submit() {
    if (this._status === 'submitted') return this._result;
    this._status = 'submitted';
    if (this._timer) { clearInterval(this._timer); this._timer = null; }

    const spent = this._start ? Math.floor((Date.now() - this._start) / 1000) : 0;
    const domains = {};
    let correct = 0, incorrect = 0, unanswered = 0;
    const wrong = [];

    this.qs.forEach(q => {
      if (!domains[q.domain]) domains[q.domain] = { total: 0, correct: 0 };
      domains[q.domain].total++;

      const ua = this._ans[q.id];
      if (!ua) {
        incorrect++; unanswered++;
        wrong.push(this._makeWrong(q, null));
      } else if (this._isCorrect(q, ua)) {
        correct++; domains[q.domain].correct++;
      } else {
        incorrect++;
        wrong.push(this._makeWrong(q, ua));
      }
    });

    Object.keys(domains).forEach(d => {
      domains[d].pct = Math.round((domains[d].correct / domains[d].total) * 100);
    });

    const total = this.qs.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const level = score >= 85 ? 'advanced' : score >= 60 ? 'intermediate' : 'beginner';

    this._result = {
      id: 'exam_' + Date.now(),
      type: this.mode, target: this.qs[0]?.source?.split('-')[0] || 'CCNA',
      date: new Date().toISOString(),
      score, total, correct, incorrect, unanswered,
      timeSpentSeconds: spent,
      domains, level,
      wrongQuestions: wrong
    };
    return this._result;
  }

  _makeWrong(q, ua) {
    return {
      id: q.id, questionText: q.text, options: q.options,
      correctAnswer: q.answer, userAnswer: ua, explanation: q.explanation,
      domain: q.domain, difficulty: q.difficulty, source: q.source || this.mode,
      tags: q.tags || [], timestamp: Date.now(),
      status: 'need_review', reviewCount: 0, lastReviewDate: null
    };
  }

  status() {
    const answered = [], marked = [], unanswered = [];
    this.qs.forEach(q => {
      if (this._ans[q.id]) answered.push(q.id); else unanswered.push(q.id);
      if (this._marked[q.id]) marked.push(q.id);
    });
    return { answered, marked, unanswered, idx: this._idx, total: this.qs.length };
  }

  timeLeft() { return Math.max(0, this._remaining); }
  state() { return this._status; }

  /**
   * 从大池子按域配比（weightings）抽取 N 题
   * 每题随机选一个 variant，确保每次模拟卷的题目组合不同
   *
   * @param {Array}  pool       — pool questions (each may have .variants[])
   * @param {number} count      — 总题数
   * @param {Object} weightings — { domainName: 0.xx, ... } 各域占比，合计 ≈ 1
   * @returns {Array} flat questions ready for ExamEngine
   */
  static pickFromPool(pool, count, weightings) {
    if (!pool || !pool.length) return [];

    // 按 domain 分组
    const byDomain = {};
    pool.forEach(q => {
      const d = q.domain || 'Other';
      if (!byDomain[d]) byDomain[d] = [];
      byDomain[d].push(q);
    });

    const result = [];
    const used = new Set(); // track conceptId to avoid duplicates in same exam

    // 遍历每个域的配比
    const entries = Object.entries(weightings || {});
    const totalWeight = entries.reduce((s, [, w]) => s + w, 0);

    entries.forEach(([domain, weight]) => {
      const domainQs = (byDomain[domain] || []).filter(q => !used.has(q.conceptId));
      const needed = Math.max(1, Math.round(count * (weight / totalWeight)));

      // Shuffle domain questions
      for (let i = domainQs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [domainQs[i], domainQs[j]] = [domainQs[j], domainQs[i]];
      }

      let picked = 0;
      for (const q of domainQs) {
        if (picked >= needed) break;
        if (used.has(q.conceptId)) continue;
        used.add(q.conceptId);

        // 随机选一个 variant
        if (q.variants && q.variants.length > 0) {
          const v = q.variants[Math.floor(Math.random() * q.variants.length)];
          result.push({ ...q, text: v.text, options: v.options, answer: v.answer, variants: undefined });
        } else {
          result.push({ ...q, variants: undefined });
        }
        picked++;
      }
    });

    // 如果还不够 count（池子太小），从剩下的补
    if (result.length < count) {
      const remaining = pool.filter(q => !used.has(q.conceptId));
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      for (const q of remaining) {
        if (result.length >= count) break;
        if (q.variants && q.variants.length > 0) {
          const v = q.variants[Math.floor(Math.random() * q.variants.length)];
          result.push({ ...q, text: v.text, options: v.options, answer: v.answer, variants: undefined });
        } else {
          result.push({ ...q, variants: undefined });
        }
      }
    }

    // Final shuffle so domains are interleaved
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }
}
