/**
 * NetLearner 题库验证工具
 * 用法：node scripts/validate-questions.js questions/generated/ccna-level-demo.json
 *
 * 检查项目：
 *   - JSON 合法性
 *   - 必填字段完整性
 *   - ID 唯一性
 *   - 选项数量 = 4
 *   - 答案在选项中
 *   - difficulty 合法值
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = ['id', 'text', 'options', 'answer', 'explanation', 'domain', 'difficulty'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_ANSWERS = ['A', 'B', 'C', 'D'];

function validate(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  const questions = data.questions || data;
  if (!Array.isArray(questions)) {
    console.error('❌ 根级不是数组，也没有 questions 字段');
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  questions.forEach((q, i) => {
    const prefix = `Q${i} (${q.id || 'no-id'})`;

    REQUIRED_FIELDS.forEach(f => {
      if (q[f] === undefined || q[f] === null || q[f] === '') {
        errors.push(`${prefix}: 缺少必填字段 '${f}'`);
      }
    });

    if (q.options && q.options.length !== 4) {
      errors.push(`${prefix}: 必须有 4 个选项 (当前 ${q.options.length} 个)`);
    }

    if (q.options && q.options.length === 4) {
      q.options.forEach((opt, oi) => {
        const expectedPrefix = String.fromCharCode(65 + oi) + '.';
        if (!opt.startsWith(expectedPrefix)) {
          errors.push(`${prefix}: 选项 ${oi} 必须以 "${expectedPrefix}" 开头 (当前: "${opt.slice(0, 10)}")`);
        }
      });
    }

    if (q.answer && !VALID_ANSWERS.includes(q.answer)) {
      errors.push(`${prefix}: 答案 '${q.answer}' 无效，必须是 A/B/C/D`);
    }

    if (q.answer && q.options && q.options.length === 4) {
      const optPrefix = q.answer + '.';
      const exists = q.options.some(o => o.startsWith(optPrefix));
      if (!exists) {
        errors.push(`${prefix}: 答案 '${q.answer}' 不在选项中 (无 "${optPrefix}" 开头的选项)`);
      }
    }

    if (q.difficulty && !VALID_DIFFICULTIES.includes(q.difficulty)) {
      errors.push(`${prefix}: difficulty '${q.difficulty}' 无效，必须是 easy/medium/hard`);
    }
  });

  const ids = questions.map(q => q.id);
  const seen = new Set();
  ids.forEach((id, i) => {
    if (seen.has(id)) {
      errors.push(`Q${i}: 重复的 ID "${id}"`);
    }
    seen.add(id);
  });

  const byDifficulty = {};
  questions.forEach(q => {
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
  });

  console.log('\n=== NetLearner 题库验证结果 ===\n');
  console.log(`  总题数: ${questions.length}`);
  console.log(`  难度分布: easy=${byDifficulty['easy'] || 0} medium=${byDifficulty['medium'] || 0} hard=${byDifficulty['hard'] || 0}`);
  console.log(`  ID 全部唯一: ${seen.size === questions.length ? '✅' : '❌'}`);
  console.log('');

  if (errors.length === 0) {
    console.log('✅ 验证通过，无错误');
    process.exit(0);
  } else {
    console.log(`❌ 发现 ${errors.length} 个错误:\n`);
    errors.forEach(e => console.log(`  - ${e}`));
    console.log('');
    process.exit(1);
  }
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('用法: node validate-questions.js <题库JSON路径>');
  process.exit(1);
}

validate(path.resolve(filePath));
