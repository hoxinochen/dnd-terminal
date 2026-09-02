import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [appSource, styleSource] = await Promise.all([
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
]);

assert(appSource.includes('validatePostCombatDiffCard'), 'post-combat correction has field-level validation');
assert(appSource.includes('field-error'), 'post-combat invalid fields receive a visual error class');
assert(appSource.includes('aria-invalid'), 'post-combat invalid fields expose ARIA state');
assert(appSource.includes('linked-editor'), 'linked entities have a graphical editor');
assert(appSource.includes('data-linked-template-choice'), 'linked entity encounter join exposes a template selector');
assert(appSource.includes('生成棋子并加入遭遇'), 'linked entity uses the player-facing wording');
assert(appSource.includes('archiveCharacterRecord'), 'character archive workflow is wired');
assert(appSource.includes('canPermanentlyDeleteCharacterRecord'), 'permanent deletion has a reference guard');
assert(appSource.includes('characterArchiveBlockers'), 'archive is blocked while battle projections or pending diffs reference the character');
assert(appSource.includes('data-abandon-post-diff'), 'a pending post-combat diff can be explicitly abandoned');
assert(appSource.includes('character.writeback.abandoned'), 'abandoning a diff creates an auditable event');
assert(appSource.includes('data-post-diff-guard'), 'stale or archived writeback candidates show a blocking explanation');
assert(appSource.includes("effect.sourceKind==='weapon-mastery'?'武器精通'"), 'weapon mastery effects show their correct source');
assert(appSource.includes('masteryStatusPanel'), 'weapon mastery status has a dedicated display');
assert(appSource.includes('id="combat-mastery-status"'), 'weapon mastery status is discoverable in the selected combatant status area');
assert(appSource.includes("effect.targetIds?.includes(c?.id)"), 'mastery status is visible from both source and target perspectives');
assert(appSource.includes('已选择的长休配置常驻显示'), 'combat mastery panel separates persistent rest configuration from runtime state');
assert(appSource.includes('entry.effect'), 'mastery benefit copy is rendered instead of only source, target and expiry');
assert(appSource.includes('masteryConfigurationMarkup'), 'selected mastery configuration is shown before any trigger occurs');
assert(appSource.includes('data-mastery-rest-edit'), 'character actions expose a controlled long-rest mastery selector');
assert(appSource.includes('data-mastery-rest-form'), 'long-rest selection has a dedicated graphical form');
assert(appSource.includes('reviseWeaponMasterySelections'), 'long-rest selection writes through the governed revision contract');
assert(appSource.includes('当前战斗投影或待审核候选差异仍引用该角色'), 'long-rest reselection is guarded while snapshots or writeback candidates are active');
assert(styleSource.includes('.field-error'), 'field-level error styling exists');
assert(styleSource.includes('.linked-editor'), 'linked editor styling exists');
assert(styleSource.includes('.mastery-panel'), 'mastery panel styling exists');
assert(styleSource.includes('.mastery-choice-list'), 'long-rest mastery choices have dedicated graphical styling');

console.log('m1-s5-stabilization-ui.test.mjs: pass');
