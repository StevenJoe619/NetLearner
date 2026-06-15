/**
 * build-pools.js — 跨厂商共享概念 → 厂商专属 pool 生成器
 *
 * 从 questions/shared-concepts.json 读取共享知识点，
 * 为每个知识点生成 Cisco（英文）和 Huawei（中文）两个版本的题目，
 * 分别注入到对应的厂商 pool 文件中。
 *
 * 用法: node tools/build-pools.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHARED_FILE = path.join(ROOT, 'questions', 'shared-concepts.json');
const POOLS_DIR = path.join(ROOT, 'questions', 'generated');

// 厂商 → pool 文件名映射
const POOL_MAP = {
  cisco: { ccna: 'ccna-pool.json', ccnp: 'ccnp-pool.json' },
  huawei: { hcia: 'hcia-pool.json', hcip: 'hcip-pool.json' }
};

// 厂商 → 目标认证映射
const TARGET_MAP = {
  cisco: { CCNA: 'ccna', 'CCNP ENCOR': 'ccnp' },
  huawei: { HCIA: 'hcia', HCIP: 'hcip' }
};

function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error(`  ⚠ 无法加载 ${file}: ${e.message}`); return null; }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function injectIntoPool(poolPath, newQuestions, vendor) {
  const pool = loadJSON(poolPath);
  if (!pool) return 0;

  let added = 0;
  const existingIds = new Set(pool.questions.map(q => q.conceptId));

  for (const q of newQuestions) {
    if (existingIds.has(q.conceptId)) continue; // 已存在则跳过
    pool.questions.push(q);
    existingIds.add(q.conceptId);
    added++;
  }

  pool._meta.totalQuestions = pool.questions.length;
  pool._meta.lastUpdated = new Date().toISOString().slice(0, 10);
  saveJSON(poolPath, pool);
  return added;
}

function main() {
  const shared = loadJSON(SHARED_FILE);
  if (!shared) { console.error('❌ 无法读取 shared-concepts.json'); process.exit(1); }

  const concepts = shared.concepts;
  console.log(`📦 共享概念池: ${concepts.length} 个知识点\n`);

  // 按厂商和目标分组
  const grouped = { cisco: { ccna: [], ccnp: [] }, huawei: { hcia: [], hcip: [] } };

  for (const c of concepts) {
    for (const [vendor, targets] of Object.entries(c.targets || {})) {
      const variants = c[vendor];
      if (!variants || !variants.length) continue;

      for (const target of targets) {
        const poolKey = TARGET_MAP[vendor]?.[target];
        if (!poolKey) continue;

        // 为每个 variant 生成 pool 条目
        variants.forEach((v, vi) => {
          const poolEntry = {
            id: `${vendor}_${c.conceptId}_${vi}`,
            conceptId: c.conceptId,
            concept: c.concept,
            domain: c.domain?.[vendor] || 'General',
            difficulty: c.difficulty || 'medium',
            source: `${vendor}-pool`,
            tags: c.tags || [],
            variants: [{
              text: v.text,
              options: v.options,
              answer: v.answer
            }]
          };
          grouped[vendor][poolKey].push(poolEntry);
        });
      }
    }
  }

  // 写入各厂商 pool
  let totalAdded = 0;
  for (const [vendor, pools] of Object.entries(grouped)) {
    for (const [poolKey, questions] of Object.entries(pools)) {
      if (!questions.length) continue;
      const poolFile = path.join(POOLS_DIR, POOL_MAP[vendor][poolKey]);
      const n = injectIntoPool(poolFile, questions, vendor);
      if (n > 0) {
        console.log(`  ✅ ${vendor}/${poolKey}: +${n} 题 (共注入 ${questions.length} 个概念)`);
        totalAdded += n;
      }
    }
  }

  console.log(`\n✨ 共注入 ${totalAdded} 道新题（跳过已存在的）`);
  console.log('💡 提示：在 shared-concepts.json 中添加新概念后，重新运行此脚本即可');
}

main();
