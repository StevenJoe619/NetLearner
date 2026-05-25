/**
 * storage.js — 存储层
 *
 * L1: localStorage（默认，零配置）
 * L2: 导出/导入 JSON 文件
 *
 * 所有模块通过全局 storage 对象读写。
 */
const APP_VERSION = 'v4.0';

class StorageBackend {
  static P = 'nl_';

  get(k) {
    try {
      const r = localStorage.getItem(StorageBackend.P + k);
      return r ? JSON.parse(r) : null;
    } catch { return null; }
  }

  set(k, v) {
    try { localStorage.setItem(StorageBackend.P + k, JSON.stringify(v)); } catch {}
  }

  remove(k) {
    try { localStorage.removeItem(StorageBackend.P + k); } catch {}
  }

  keys() {
    const ks = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(StorageBackend.P)) ks.push(k.slice(StorageBackend.P.length));
    }
    return ks;
  }

  exportAll() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(StorageBackend.P)) {
        try { data[k.slice(StorageBackend.P.length)] = JSON.parse(localStorage.getItem(k)); }
        catch { data[k.slice(StorageBackend.P.length)] = localStorage.getItem(k); }
      }
    }
    return { _meta: { exportDate: new Date().toISOString(), version: 4, appVersion: APP_VERSION, source: 'NetLearner' }, ...data };
  }

  importAll(data) {
    let c = 0;
    for (const [k, v] of Object.entries(data)) {
      if (k === '_meta') continue;
      this.set(k, v); c++;
    }
    return c;
  }

  clear() { this.keys().forEach(k => this.remove(k)); }

  size() {
    let s = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(StorageBackend.P)) {
        const r = localStorage.getItem(k);
        if (r) s += new Blob([r]).size;
      }
    }
    return s;
  }
}

class StorageService {
  constructor() { this.b = new StorageBackend(); }

  get(k) { return this.b.get(k); }
  set(k, v) { this.b.set(k, v); }
  remove(k) { this.b.remove(k); }
  keys() { return this.b.keys(); }

  export() {
    const d = this.b.exportAll();
    const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `NetLearner_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    return d;
  }

  import() {
    return new Promise((resolve, reject) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = '.json';
      inp.onchange = async () => {
        const f = inp.files[0];
        if (!f) return reject(new Error('取消'));
        try {
          const t = await f.text(); const d = JSON.parse(t);
          if (!d._meta) return reject(new Error('非 NetLearner 数据文件'));
          if (d._meta.version > 4) return reject(new Error('请更新 NetLearner 后再导入'));
          this.b.importAll(d);
          resolve({ count: Object.keys(d).length - 1 });
        } catch (e) {
          reject(e instanceof SyntaxError ? new Error('JSON 格式错误') : e);
        }
      };
      inp.click();
    });
  }

  clear() { this.b.clear(); }

  stats() {
    const ks = this.keys();
    const s = {};
    ks.forEach(k => s[k] = this.b.size ? '?' : 0);
    return { keys: ks, totalSize: this.b.size() };
  }
}

const storage = new StorageService();
