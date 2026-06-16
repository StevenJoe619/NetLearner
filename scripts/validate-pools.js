#!/usr/bin/env node
/**
 * validate-pools.js — 题库格式校验
 *
 * 校验规则：
 * - single/boolean: answer 必须是字符串（单字母）
 * - multiple: answer 必须是逗号分隔字符串 (如 "A,B,C")
 * - drag/match: answer 必须是逗号分隔数字字符串 (如 "0,1,2,3")
 * - testlet: answer 必须是 JSON 数组字符串 (如 '["B","A"]')
 * - fill: answer 可以是任意字符串
 * - type 值与题干文本不矛盾
 *
 * 用法: node scripts/validate-pools.js [pool-files...]
 *       不传参则校验所有 generated/*.json
 */
const fs = require('fs');
const path = require('path');

const GENERATED_DIR = path.join(__dirname, '..', 'questions', 'generated');
const RE_CHOOSE_ONE = /\(Choose one\.?\)/i;
const RE_CHOOSE_MULTI = /\(Choose (two|three|2|3)\.?\)/i;

let totalErrors = 0;

function validatePool(filePath) {
  const name = path.basename(filePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const questions = data.questions || [];
  let errors = [];

  for (const q of questions) {
    const qid = q.id || '(no id)';
    const qtype = q.type || 'single';
    const variants = q.variants || [];

    for (const v of variants) {
      const ans = v.answer;
      const text = v.text || '';
      const isArray = Array.isArray(ans);
      const isString = typeof ans === 'string';

      // --- Rule 1: answer must be string (not array) ---
      if (isArray) {
        errors.push(`${qid}: answer 是数组格式 [${ans}], 需改为字符串`);
        continue;
      }

      if (!isString) {
        errors.push(`${qid}: answer 类型错误 (${typeof ans})`);
        continue;
      }

      const hasComma = ans.includes(',');
      const isSingleLetter = /^[A-Z]$/.test(ans);
      const isNumberSeq = /^[\d,]+$/.test(ans) && hasComma;
      const isJsonArray = ans.startsWith('[') && ans.endsWith(']');

      // --- Rule 2: single / boolean ---
      if (qtype === 'single' || qtype === 'boolean') {
        if (hasComma) {
          errors.push(`${qid}: type=${qtype} 但 answer 含逗号: "${ans}"`);
        }
        if (RE_CHOOSE_MULTI.test(text)) {
          errors.push(`${qid}: type=${qtype} 但题干说多选: "${text.substring(0,60)}"`);
        }
      }

      // --- Rule 3: multiple ---
      else if (qtype === 'multiple') {
        if (isSingleLetter) {
          if (RE_CHOOSE_ONE.test(text)) {
            errors.push(`${qid}: type=multiple 但实际是单选 (ans="${ans}", 题干含Choose one)`);
          } else if (!RE_CHOOSE_MULTI.test(text)) {
            errors.push(`${qid}: type=multiple 但答案单字母 "${ans}", 题干无多选标记`);
          }
        }
        if (isNumberSeq) {
          errors.push(`${qid}: type=multiple 但 answer 是数字序列 "${ans}", 疑似 drag/match`);
        }
      }

      // --- Rule 4: drag ---
      else if (qtype === 'drag') {
        if (!isNumberSeq) {
          errors.push(`${qid}: type=drag 但 answer 格式不对: "${ans}" (期望 "0,1,2")`);
        }
      }

      // --- Rule 5: match ---
      else if (qtype === 'match') {
        if (!isNumberSeq) {
          errors.push(`${qid}: type=match 但 answer 格式不对: "${ans}" (期望 "0,1,2")`);
        }
      }

      // --- Rule 6: testlet ---
      else if (qtype === 'testlet') {
        if (!isJsonArray) {
          errors.push(`${qid}: type=testlet 但 answer 不是JSON数组: "${ans}"`);
        } else {
          try {
            const parsed = JSON.parse(ans);
            if (!Array.isArray(parsed)) {
              errors.push(`${qid}: type=testlet 但 JSON.parse 结果不是数组`);
            }
          } catch {
            errors.push(`${qid}: type=testlet 但 answer JSON 解析失败: "${ans}"`);
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    console.log(`❌ ${name} (${questions.length}题) — ${errors.length} 个错误:`);
    errors.forEach(e => console.log(`   ${e}`));
    totalErrors += errors.length;
  } else {
    console.log(`✅ ${name} (${questions.length}题) — 全部通过`);
  }
}

// Main
const args = process.argv.slice(2);
const files = args.length > 0
  ? args
  : fs.readdirSync(GENERATED_DIR)
      .filter(f => f.endsWith('.json') && !f.startsWith('_'))
      .map(f => path.join(GENERATED_DIR, f));

for (const f of files) {
  const resolved = path.resolve(f);
  if (!fs.existsSync(resolved)) {
    console.log(`⚠️  文件不存在: ${f}`);
    continue;
  }
  validatePool(resolved);
}

if (totalErrors > 0) {
  console.log(`\n❗ 总计 ${totalErrors} 个错误，需要修复`);
  process.exit(1);
} else {
  console.log(`\n🎉 全部通过`);
}
