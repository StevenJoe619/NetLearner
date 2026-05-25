/**
 * router.js — 哈希路由
 *
 * 映射 hash → page-id，触发 page-change 事件。
 */
class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('hashchange', () => this.resolve());
    window.addEventListener('DOMContentLoaded', () => this.resolve());
  }

  register(path, pageId) { this.routes[path] = pageId; }

  resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('?')[0];
    const qs = hash.includes('?') ? hash.split('?')[1] : '';
    let pid = this.routes[path];
    if (!pid) pid = 'page-home';

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(pid);
    if (el) el.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === pid);
    });

    window.dispatchEvent(new CustomEvent('page-change', {
      detail: { page: pid, params: new URLSearchParams(qs) }
    }));
  }

  go(path) { window.location.hash = path; }
}

const router = new Router();
router.register('/', 'page-home');
router.register('/level-test', 'page-level-test');
router.register('/exam', 'page-exam');
router.register('/result', 'page-result');
router.register('/wrong-answers', 'page-wrong-answers');
router.register('/planner', 'page-planner');
router.register('/settings', 'page-settings');
router.register('/about', 'page-about');
