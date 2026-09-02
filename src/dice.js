const LIMITS = Object.freeze({ maxTerms: 20, maxDicePerTerm: 100, maxTotalDice: 200, minSides: 2, maxSides: 1000, maxModifier: 100000 });
const QUICK_SIDES = Object.freeze([4, 6, 8, 10, 12, 20, 100]);

const normalize = value => String(value ?? '').trim().replace(/\s+/g, '').toLowerCase();
const signed = value => value >= 0 ? `+${value}` : String(value);

export function parseDiceFormula(value) {
  const raw = String(value ?? '');
  const compact = normalize(value);
  if (!compact) return { ok: false, error: '请输入骰式。' };
  if (!/^[+-]?(?:\d*d\d+|\d+)(?:[+-](?:\d*d\d+|\d+))*$/i.test(compact)) return { ok: false, error: '骰式只支持多个 NdM 与常数的加减，例如 2d6+2d4+1。' };
  const chunks = compact.match(/[+-]?[^+-]+/g) || [];
  if (chunks.length > LIMITS.maxTerms) return { ok: false, error: `最多 ${LIMITS.maxTerms} 项。` };
  const terms = [];
  let totalDice = 0;
  let modifier = 0;
  for (const chunk of chunks) {
    const sign = chunk.startsWith('-') ? -1 : 1;
    const body = chunk.replace(/^[+-]/, '');
    const dice = body.match(/^(\d*)d(\d+)$/i);
    if (dice) {
      const count = Number(dice[1] || 1), sides = Number(dice[2]);
      if (!Number.isSafeInteger(count) || !Number.isSafeInteger(sides) || count < 1 || count > LIMITS.maxDicePerTerm || sides < LIMITS.minSides || sides > LIMITS.maxSides) return { ok: false, error: `骰项必须在 1d${LIMITS.minSides} 至 ${LIMITS.maxDicePerTerm}d${LIMITS.maxSides} 之间。` };
      totalDice += count;
      if (totalDice > LIMITS.maxTotalDice) return { ok: false, error: `单次掷骰总数最多 ${LIMITS.maxTotalDice} 颗。` };
      terms.push({ kind: 'dice', sign, count, sides });
    } else {
      const amount = Number(body);
      if (!Number.isSafeInteger(amount)) return { ok: false, error: '常数必须是整数。' };
      modifier += sign * amount;
      if (Math.abs(modifier) > LIMITS.maxModifier) return { ok: false, error: `常数合计绝对值最多 ${LIMITS.maxModifier}。` };
      terms.push({ kind: 'constant', sign, amount });
    }
  }
  const diceTerms = terms.filter(term => term.kind === 'dice');
  if (!diceTerms.length) return { ok: false, error: '骰式至少需要一个 NdM 骰项。' };
  const canonical = terms.map((term, index) => {
    const body = term.kind === 'dice' ? `${term.count}d${term.sides}` : String(term.amount);
    return `${index && term.sign > 0 ? '+' : term.sign < 0 ? '-' : ''}${body}`;
  }).join('');
  return { ok: true, raw, canonical, terms, diceTerms, modifier, totalDice };
}

function quickCandidates(digits) {
  const results = [];
  const visit = (index, parts) => {
    if (results.length > 12) return;
    if (index === digits.length) { results.push(parts); return; }
    const constant = Number(digits.slice(index));
    if (Number.isSafeInteger(constant) && constant <= LIMITS.maxModifier) results.push([...parts, { kind: 'constant', sign: 1, amount: constant }]);
    for (const count of [3, 2, 1]) {
      const countText = digits.slice(index, index + count);
      if (!countText || (countText.length > 1 && countText.startsWith('0'))) continue;
      const dieCount = Number(countText);
      if (!Number.isInteger(dieCount) || dieCount < 1 || dieCount > 9) continue;
      for (const sides of QUICK_SIDES) {
        const sideText = String(sides);
        if (digits.slice(index + count, index + count + sideText.length) !== sideText) continue;
        visit(index + count + sideText.length, [...parts, { kind: 'dice', sign: 1, count: dieCount, sides }]);
      }
    }
  };
  visit(0, []);
  return [...new Map(results.map(parts => {
    const formula = parts.map((term, index) => `${index ? '+' : ''}${term.kind === 'dice' ? `${term.count}d${term.sides}` : term.amount}`).join('');
    return [formula, formula];
  })).values()];
}

export function parseDiceShortcut(value) {
  const digits = String(value ?? '').trim();
  if (!/^\d{2,}$/.test(digits)) return { ok: false, error: '快捷输入只接受连续数字。' };
  const candidates = quickCandidates(digits).filter(candidate => parseDiceFormula(candidate).ok);
  if (!candidates.length) return { ok: false, error: '未能按快捷规则识别；请直接输入骰式。' };
  return { ok: true, candidates, ambiguous: candidates.length > 1 };
}

export function rollDiceFormula(parsed, mode = 'normal', random = Math.random) {
  if (!parsed?.ok) throw new Error('无效骰式。');
  const legalMode = ['normal', 'advantage', 'disadvantage'].includes(mode) ? mode : 'normal';
  if (legalMode !== 'normal' && !(parsed.diceTerms.length === 1 && parsed.diceTerms[0].sign === 1 && parsed.diceTerms[0].count === 1 && parsed.diceTerms[0].sides === 20)) throw new Error('优势/劣势只用于正向 1d20（可附加常数）。');
  const rolledTerms = parsed.diceTerms.map(term => ({ ...term, dice: Array.from({ length: term.count }, () => 1 + Math.floor(random() * term.sides)) }));
  const dice = legalMode === 'normal' ? rolledTerms.flatMap(term => term.dice.map(value => term.sign * value)) : [rolledTerms[0].dice[0], 1 + Math.floor(random() * 20)];
  const kept = legalMode === 'advantage' ? Math.max(...dice) : legalMode === 'disadvantage' ? Math.min(...dice) : dice.reduce((sum, value) => sum + value, 0);
  let diceIndex = 0;
  const terms = parsed.terms.map(term => {
    if (term.kind === 'constant') return { ...term, subtotal: term.sign * term.amount };
    const rolled = rolledTerms[diceIndex++];
    if (legalMode !== 'normal' && diceIndex === 1) return { ...rolled, dice: [...dice], subtotal: rolled.sign * kept, dropped: dice.find(value => value !== kept) ?? null };
    return { ...rolled, subtotal: rolled.sign * rolled.dice.reduce((sum, value) => sum + value, 0) };
  });
  return { formulaRaw: parsed.raw, formulaCanonical: parsed.canonical, raw: parsed.raw, canonical: parsed.canonical, terms, modifier: parsed.modifier, mode: legalMode, dice, kept, total: kept + parsed.modifier };
}

export { LIMITS, QUICK_SIDES, signed };
