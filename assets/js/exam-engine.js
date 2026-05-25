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
      } else if (ua === q.answer) {
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
}
