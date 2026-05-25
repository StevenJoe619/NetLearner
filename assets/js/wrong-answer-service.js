/**
 * wrong-answer-service.js — 错题本服务
 */

const WA_KEY = 'wa';

class WrongAnswerService {
  constructor() { this.s = storage; }

  batchAdd(items) {
    if (!items || !items.length) return 0;
    const data = this._load();
    const ids = new Set(data.items.map(i => i.id));
    let c = 0;
    items.forEach(i => { if (!ids.has(i.id)) { data.items.unshift(i); ids.add(i.id); c++; } });
    this._save(data);
    return c;
  }

  getAll(filter) {
    let items = this._load().items;
    if (filter) {
      if (filter.domain) items = items.filter(i => i.domain === filter.domain);
      if (filter.status) items = items.filter(i => i.status === filter.status);
    }
    return items;
  }

  getById(id) { return this._load().items.find(i => i.id === id) || null; }

  updateStatus(id, st) {
    const data = this._load();
    const i = data.items.find(i => i.id === id);
    if (!i) return false;
    i.status = st;
    i.lastReviewDate = Date.now();
    if (st === 'mastered') i.reviewCount = (i.reviewCount || 0) + 1;
    this._save(data);
    return true;
  }

  remove(id) {
    const data = this._load();
    const idx = data.items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    data.items.splice(idx, 1);
    this._save(data);
    return true;
  }

  clear() { this._save({ version: 4, items: [] }); }

  stats() {
    const items = this._load().items;
    const byDomain = {}, byStatus = { need_review: 0, almost: 0, mastered: 0 };
    items.forEach(i => {
      byDomain[i.domain] = (byDomain[i.domain] || 0) + 1;
      if (byStatus[i.status] !== undefined) byStatus[i.status]++;
    });
    return { total: items.length, byDomain, byStatus };
  }

  reviewItems(filter) {
    return this.getAll(filter).filter(i => i.status === 'need_review' || i.status === 'almost');
  }

  _load() { const d = this.s.get(WA_KEY); return d?.version === 4 ? d : { version: 4, items: [] }; }
  _save(d) { this.s.set(WA_KEY, d); }
}

const was = new WrongAnswerService();
