import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const ARTIFACT_DIR = '/tmp/dnd-ux-review';
await mkdir(ARTIFACT_DIR, {recursive:true});
const port = 9368;
const profileDir = `/tmp/chrome-test-profile-${Date.now()}`;

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  '--window-size=1440,900',
  `--user-data-dir=${profileDir}`,
  'http://127.0.0.1:4174/'
]);

const consoleErrors = [];

async function connectCdp() {
  for (let i = 0; i < 20; i++) {
    try {
      const listRes = await fetch(`http://127.0.0.1:${port}/json`);
      const tabs = await listRes.json();
      const page = tabs.find(t => t.type === 'page' && t.url.includes('4174')) || tabs[0];
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Failed to connect to Chrome remote debugging port within timeout.');
}
let ws;
let send;

try {
  const wsUrl = await connectCdp();
  ws = new WebSocket(wsUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  send = (method, params = {}) => new Promise((resolve, reject) => {
    const msgId = id++;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === msgId) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
      const text = data.params.args.map(a => a.value || a.description || '').join(' ');
      consoleErrors.push(text);
    }
    if (data.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(data.params.exceptionDetails?.text || 'Runtime exception');
    }
    if (data.method === 'Page.javascriptDialogOpening') {
      send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 800));

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r?.exceptionDetails) {
      throw new Error(`JS Exception: ${JSON.stringify(r.exceptionDetails)}`);
    }
    return r?.result?.value;
  };

  const captureScreenshot = async (filename) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(res.data, 'base64');
    await writeFile(`${ARTIFACT_DIR}/${filename}`, buf);
    console.log(`[PASS] Saved screenshot: ${filename}`);
  };

  console.log('--- Step 1: Initialize fixture session and character projection ---');
  await evalJs(`(() => {
    localStorage.clear();
    location.hash = '#settings';
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Open developer tools details
  await evalJs(`(() => {
    const devTools = document.querySelector('.developer-validation-tools details');
    if (devTools) devTools.setAttribute('open', 'true');
  })()`);
  await new Promise(r => setTimeout(r, 200));

  // Request and confirm fixture load
  await evalJs(`(() => {
    const loadBtn = document.querySelector('[data-load-fixtures-request]');
    if (loadBtn) loadBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 300));

  await evalJs(`(() => {
    const confirmBtn = document.querySelector('[data-load-fixtures-confirm="direct"]');
    if (confirmBtn) confirmBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  // Seed character records and bind characterSheetRef to the PC combatant
  const charRecord = {
    schemaVersion: '0.3.0-m1-s5',
    characterId: 'char-fighter-1',
    status: 'active',
    currentRevision: 1,
    revisions: [
      {
        schemaVersion: '0.3.0-m1-s5',
        revision: 1,
        characterId: 'char-fighter-1',
        name: '散打武者',
        ownerHint: '玩家甲',
        ruleVersion: '2024',
        totalLevel: 5,
        classes: [{ name: '武僧', subclass: '散打宗', level: 5 }],
        origin: { species: '人类', background: '侍祭', history: '武道修炼。' },
        armorClass: 16,
        hp: { current: 38, max: 38 },
        speed: 40,
        initiativeModifier: 4,
        proficiencyBonus: 3,
        passivePerception: 14,
        combatState: { tempHp: 0, conditions: [], concentration: 'none', hitDice: '5d8', heroicInspiration: false },
        abilities: {
          strength: { score: 10, modifier: { calculatedValue: 0, effectiveValue: 0, status: 'calculated' } },
          dexterity: { score: 18, modifier: { calculatedValue: 4, effectiveValue: 4, status: 'calculated' } },
          constitution: { score: 14, modifier: { calculatedValue: 2, effectiveValue: 2, status: 'calculated' } },
          intelligence: { score: 10, modifier: { calculatedValue: 0, effectiveValue: 0, status: 'calculated' } },
          wisdom: { score: 16, modifier: { calculatedValue: 3, effectiveValue: 3, status: 'calculated' } },
          charisma: { score: 8, modifier: { calculatedValue: -1, effectiveValue: -1, status: 'calculated' } }
        },
        saves: [],
        skills: [],
        senses: ['被动察觉 14'],
        languages: ['通用语'],
        resources: { '气': { current: 5, max: 5, recovery: 'short-rest', note: '武僧气池', sourceStatus: 'dm-authored' } },
        attackProfiles: [{ id: 'atk-unarmed', name: '徒手打击', attackBonus: 7, damageFormula: '1d6+4', damageType: '钝击' }],
        actions: [{ id: 'act-flurry', name: '疾风连击', economy: 'bonus-action', description: '消耗 1 点气' }],
        equipment: [{ id: 'eq-robes', name: '僧袍', quantity: 1, equipped: true, container: 'body' }],
        weaponMastery: { status: 'none', note: '无武器精通' },
        linkedEntities: [],
        controlledEntities: [],
        spellcastingProfiles: [],
        spellResourcePools: [],
        spells: [],
        note: '测试武僧卡',
        source: { kind: 'scratch', status: 'verified', note: '自动化验证创建' }
      }
    ]
  };

  await evalJs(`(() => {
    const STORAGE_KEY = 'dnd-terminal.v0.7.0.workbench.session.current';
    const CHARACTER_KEY = 'dnd-terminal.v0.3.0-m1-s5.character-records';
    const charRecord = ${JSON.stringify(charRecord)};
    localStorage.setItem(CHARACTER_KEY, JSON.stringify([charRecord]));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.session?.combatants) {
      const pc = stored.session.combatants.find(c => c.name.includes('武者'));
      if (pc) {
        pc.characterSheetRef = { characterId: charRecord.characterId, revision: 1 };
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  })()`);

  // Reload page to apply synchronized character records and session
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 1000));

  // Navigate to Battle workspace
  await evalJs(`(() => {
    const battleBtn = document.querySelector('[data-workspace="battle"]');
    if (battleBtn) battleBtn.click();
    else location.hash = '#battle';
  })()`);
  await new Promise(r => setTimeout(r, 500));

  console.log('--- Step 2: Hard Assertion 1 - Desktop top notice and topbar non-overlap ---');
  const topbarNoticeMetrics = await evalJs(`(() => {
    const topbar = document.querySelector('[data-workbench-topbar]');
    const notice = document.querySelector('.global-notice, .notice');
    if (!topbar) return { error: 'topbar-not-found' };
    const topbarRect = topbar.getBoundingClientRect();
    const noticeRect = (notice && notice.offsetParent !== null && notice.textContent.trim().length > 0)
      ? notice.getBoundingClientRect()
      : null;
    return {
      topbarPresent: true,
      topbarWidth: topbarRect.width,
      topbarHeight: topbarRect.height,
      topbarBottom: topbarRect.bottom,
      noticeRect
    };
  })()`);

  assert.equal(topbarNoticeMetrics.topbarPresent, true, 'Workbench topbar must exist in DOM');
  assert.ok(topbarNoticeMetrics.topbarWidth > 0, 'Topbar width must be positive');
  assert.ok(topbarNoticeMetrics.topbarHeight > 0, 'Topbar height must be positive');
  if (topbarNoticeMetrics.noticeRect) {
    assert.ok(
      topbarNoticeMetrics.noticeRect.top >= topbarNoticeMetrics.topbarBottom - 2,
      `Notice (top: ${topbarNoticeMetrics.noticeRect.top}) must not vertically overlap topbar (bottom: ${topbarNoticeMetrics.topbarBottom})`
    );
  }
  console.log('[PASS] Hard Assertion 1: Desktop topbar and notice non-overlap verified.');

  console.log('--- Step 3: Hard Assertion 2 - Combat control buttons layout and non-overflow ---');
  const ctrlBarMetricsBeforeStart = await evalJs(`(() => {
    const bar = document.querySelector('.combat-ctrl-bar');
    if (!bar) return { error: 'combat-ctrl-bar-not-found' };
    const rect = bar.getBoundingClientRect();
    const buttons = Array.from(bar.querySelectorAll('button')).map(btn => {
      const bRect = btn.getBoundingClientRect();
      return {
        text: btn.textContent.trim(),
        visible: btn.offsetParent !== null,
        width: bRect.width,
        height: bRect.height,
        right: bRect.right,
        barRight: rect.right
      };
    });
    return {
      scrollWidth: bar.scrollWidth,
      clientWidth: bar.clientWidth,
      rectWidth: rect.width,
      buttons
    };
  })()`);

  assert.ok(!ctrlBarMetricsBeforeStart.error, 'Combat control bar must exist');
  assert.ok(
    ctrlBarMetricsBeforeStart.scrollWidth <= ctrlBarMetricsBeforeStart.clientWidth + 2,
    `Combat control bar must not horizontally overflow: scrollWidth=${ctrlBarMetricsBeforeStart.scrollWidth}, clientWidth=${ctrlBarMetricsBeforeStart.clientWidth}`
  );
  assert.ok(ctrlBarMetricsBeforeStart.buttons.length >= 2, 'Combat control bar must contain buttons');
  for (const btn of ctrlBarMetricsBeforeStart.buttons) {
    assert.equal(btn.visible, true, `Button "${btn.text}" must be visible`);
    assert.ok(btn.width > 0 && btn.height > 0, `Button "${btn.text}" must have non-zero dimensions`);
    assert.ok(
      btn.right <= btn.barRight + 2,
      `Button "${btn.text}" right edge (${btn.right}) must not exceed bar right edge (${btn.barRight})`
    );
  }

  // Roll initiative to advance combat round
  await evalJs(`(() => {
    const initBtn = document.querySelector('button[data-action="initiative"]');
    if (initBtn) initBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));
  await evalJs(`(() => {
    const confirmInit = document.querySelector('button[data-action="confirm-initiative"]');
    if (confirmInit) confirmInit.click();
  })()`);
  await new Promise(r => setTimeout(r, 600));

  // Re-verify control bar during active combat
  const ctrlBarMetricsActive = await evalJs(`(() => {
    const bar = document.querySelector('.combat-ctrl-bar');
    if (!bar) return { error: 'combat-ctrl-bar-not-found' };
    const rect = bar.getBoundingClientRect();
    const buttons = Array.from(bar.querySelectorAll('button')).map(btn => {
      const bRect = btn.getBoundingClientRect();
      return {
        text: btn.textContent.trim(),
        visible: btn.offsetParent !== null,
        width: bRect.width,
        height: bRect.height,
        right: bRect.right,
        barRight: rect.right
      };
    });
    return {
      scrollWidth: bar.scrollWidth,
      clientWidth: bar.clientWidth,
      buttons
    };
  })()`);

  assert.ok(!ctrlBarMetricsActive.error, 'Active combat control bar must exist');
  assert.ok(
    ctrlBarMetricsActive.scrollWidth <= ctrlBarMetricsActive.clientWidth + 2,
    `Active combat control bar must not horizontally overflow: scrollWidth=${ctrlBarMetricsActive.scrollWidth}, clientWidth=${ctrlBarMetricsActive.clientWidth}`
  );
  for (const btn of ctrlBarMetricsActive.buttons) {
    assert.equal(btn.visible, true, `Active button "${btn.text}" must be visible`);
    assert.ok(
      btn.right <= btn.barRight + 2,
      `Active button "${btn.text}" right edge (${btn.right}) must not exceed bar right edge (${btn.barRight})`
    );
  }
  console.log('[PASS] Hard Assertion 2: Combat control buttons layout and non-overflow verified.');
  await captureScreenshot('ux_workbench_dark.png');

  console.log('--- Step 4: Hard Assertion 3 - Resources fold state preservation after spend ---');
  // Select PC combatant
  const selectPcResult = await evalJs(`(() => {
    const cards = Array.from(document.querySelectorAll('[data-select-card]'));
    const pcCard = cards.find(card => card.textContent.includes('散打武者'));
    if (!pcCard) return { error: 'pc-card-not-found' };
    pcCard.click();
    return { ok: true, id: pcCard.getAttribute('data-select-card') };
  })()`);
  assert.equal(selectPcResult.ok, true, '散打武者 card must exist and be selectable');
  await new Promise(r => setTimeout(r, 400));

  // Open resources fold
  const openResResult = await evalJs(`(() => {
    const resFold = document.querySelector('details[data-inspector-fold="resources"]');
    if (!resFold) return { error: 'resources-fold-not-found' };
    resFold.setAttribute('open', 'true');
    resFold.dispatchEvent(new Event('toggle'));
    return { ok: true, open: resFold.hasAttribute('open') };
  })()`);
  assert.equal(openResResult.ok, true, 'Resources fold must exist for PC');
  assert.equal(openResResult.open, true, 'Resources fold must be open');
  await new Promise(r => setTimeout(r, 200));

  // Click spend resource button
  const spendResult = await evalJs(`(() => {
    const spendBtn = document.querySelector('details[data-inspector-fold="resources"] button[data-resource]');
    if (!spendBtn) return { error: 'spend-button-not-found' };
    spendBtn.click();
    return { ok: true, resource: spendBtn.getAttribute('data-resource') };
  })()`);
  assert.equal(spendResult.ok, true, 'Spend resource button must exist inside resources fold');
  await new Promise(r => setTimeout(r, 500));

  // Hard assert: resources fold MUST remain open after re-render!
  const isResStillOpen = await evalJs(`(() => {
    const resFold = document.querySelector('details[data-inspector-fold="resources"]');
    return resFold ? resFold.hasAttribute('open') : false;
  })()`);
  assert.equal(isResStillOpen, true, 'Resources fold MUST remain open after spending resource and re-rendering');
  console.log('[PASS] Hard Assertion 3: Resources fold state preservation verified.');

  console.log('--- Step 5: Hard Assertion 4 - Actions fold auto-expansion on shortcut action click ---');
  // Select a monster combatant (火巨人)
  const selectMonsterResult = await evalJs(`(() => {
    const cards = Array.from(document.querySelectorAll('[data-select-card]'));
    const monsterCard = cards.find(card => card.textContent.includes('巨人'));
    if (!monsterCard) return { error: 'monster-card-not-found' };
    monsterCard.click();
    return { ok: true, name: monsterCard.textContent.trim().slice(0, 20) };
  })()`);
  assert.equal(selectMonsterResult.ok, true, '火巨人 monster card must exist and be selectable');
  await new Promise(r => setTimeout(r, 400));

  // Explicitly close actions fold
  await evalJs(`(() => {
    const actFold = document.querySelector('details[data-inspector-fold="actions"]');
    if (actFold) {
      actFold.removeAttribute('open');
      actFold.dispatchEvent(new Event('toggle'));
    }
  })()`);
  await new Promise(r => setTimeout(r, 200));

  const isActClosedBefore = await evalJs(`(() => {
    const actFold = document.querySelector('details[data-inspector-fold="actions"]');
    return actFold ? actFold.hasAttribute('open') : null;
  })()`);
  assert.equal(isActClosedBefore, false, 'Actions fold must be closed prior to shortcut action click');

  // Click a visible shortcut reference action button
  const clickRefActionResult = await evalJs(`(() => {
    const actionBtn = document.querySelector('button[data-reference-action]');
    if (!actionBtn) return { error: 'action-ref-btn-not-found' };
    const name = actionBtn.getAttribute('data-reference-name');
    actionBtn.click();
    return { ok: true, name };
  })()`);
  assert.equal(clickRefActionResult.ok, true, 'Reference action shortcut button must exist');
  await new Promise(r => setTimeout(r, 500));

  // Hard assert: actions fold MUST be automatically opened
  const actFoldStateAfter = await evalJs(`(() => {
    const actFold = document.querySelector('details[data-inspector-fold="actions"]');
    const activeBtn = document.querySelector('button[data-reference-action].active');
    return {
      isOpen: actFold ? actFold.hasAttribute('open') : false,
      activeActionName: activeBtn ? activeBtn.getAttribute('data-reference-name') : null
    };
  })()`);
  assert.equal(actFoldStateAfter.isOpen, true, 'Actions fold MUST automatically open after clicking reference action');
  assert.equal(
    actFoldStateAfter.activeActionName,
    clickRefActionResult.name,
    'The active action card within fold must match the clicked reference action'
  );
  console.log('[PASS] Hard Assertion 4: Actions fold auto-expansion and card highlighting verified.');

  console.log('--- Step 6: Hard Assertion 5 - Death successor form empty inheritance preservation ---');
  // Re-select PC combatant
  await evalJs(`(() => {
    const cards = Array.from(document.querySelectorAll('[data-select-card]'));
    const pcCard = cards.find(card => card.textContent.includes('散打武者'));
    if (pcCard) pcCard.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));

  // Set PC life phase to dead via DM correction form
  const setDeadResult = await evalJs(`(() => {
    const form = document.querySelector('[data-life-correction-form]');
    if (!form) return false;
    const phaseSelect = form.querySelector('select[name="lifePhase"]');
    const hpInput = form.querySelector('input[name="hp"]');
    const reasonInput = form.querySelector('input[name="reason"]');
    if (phaseSelect && hpInput && reasonInput) {
      phaseSelect.value = 'dead';
      hpInput.value = '0';
      reasonInput.value = 'DM 裁定战死';
      form.requestSubmit();
      return true;
    }
    return false;
  })()`);
  assert.equal(setDeadResult, true, 'DM life phase correction form must submit dead status');
  await new Promise(r => setTimeout(r, 600));

  // Re-click PC card
  await evalJs(`(() => {
    const cards = Array.from(document.querySelectorAll('[data-select-card]'));
    const pcCard = cards.find(card => card.textContent.includes('散打武者'));
    if (pcCard) pcCard.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));

  // Click Outcome: 以新身体或新形态继续冒险
  const clickSuccessorOutcome = await evalJs(`(() => {
    const btn = document.querySelector('button[data-death-outcome="successor"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  })()`);
  assert.equal(clickSuccessorOutcome, true, 'Successor outcome button must exist and be clicked');
  await new Promise(r => setTimeout(r, 400));

  // Select shape: 普通新身体 (opens s2SuccessorPanel)
  const clickNormalShape = await evalJs(`(() => {
    const btn = document.querySelector('button[data-v060-shape="normal"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  })()`);
  assert.equal(clickNormalShape, true, 'Normal shape button must exist and be clicked');
  await new Promise(r => setTimeout(r, 500));

  // Check initial state: 8 inheritance checkboxes, all checked by default
  const initialInheritanceState = await evalJs(`(() => {
    const form = document.querySelector('[data-s2-successor-form]');
    if (!form) return { error: 'successor-form-not-found' };
    const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"][name="inheritGroups"]'));
    return {
      total: checkboxes.length,
      checkedCount: checkboxes.filter(c => c.checked).length
    };
  })()`);
  assert.ok(!initialInheritanceState.error, 'Successor form must be present');
  assert.equal(initialInheritanceState.total, 8, 'Must render exactly 8 inheritance checkboxes');
  assert.equal(initialInheritanceState.checkedCount, 8, 'Initial successor form must default to all 8 checked');

  // Deselect all inheritance checkboxes and dispatch change/input events
  const deselectAllResult = await evalJs(`(() => {
    const form = document.querySelector('[data-s2-successor-form]');
    const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"][name="inheritGroups"]'));
    for (const cb of checkboxes) {
      cb.checked = false;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      cb.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const remainingChecked = form.querySelectorAll('input[type="checkbox"][name="inheritGroups"]:checked').length;
    return { remainingChecked };
  })()`);
  assert.equal(deselectAllResult.remainingChecked, 0, 'Checked count must immediately be 0 after deselecting all');

  // Switch shape to 不死生物形态
  const switchToUndeadResult = await evalJs(`(() => {
    const undeadBtn = document.querySelector('button[data-v060-shape="undead"]');
    if (!undeadBtn) return false;
    undeadBtn.click();
    return true;
  })()`);
  assert.equal(switchToUndeadResult, true, 'Undead shape button must exist and be clicked');
  await new Promise(r => setTimeout(r, 500));

  // Hard assert in Undead shape form: checked count strictly 0!
  const undeadInheritanceState = await evalJs(`(() => {
    const form = document.querySelector('[data-s2-successor-form]');
    if (!form) return { error: 'successor-form-not-found' };
    const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"][name="inheritGroups"]'));
    return {
      total: checkboxes.length,
      checkedCount: checkboxes.filter(c => c.checked).length,
      selectedClassCount: form.querySelectorAll('.inheritance-card.selected').length
    };
  })()`);
  assert.ok(!undeadInheritanceState.error, 'Undead shape successor form must exist');
  assert.equal(undeadInheritanceState.total, 8, 'Undead shape must render 8 inheritance checkboxes');
  assert.equal(
    undeadInheritanceState.checkedCount,
    0,
    'CRITICAL: Checked count in Undead shape MUST be strictly 0 (not reverted to all checked)'
  );
  assert.equal(
    undeadInheritanceState.selectedClassCount,
    0,
    'No inheritance-card element should have selected class in Undead shape'
  );

  // Switch shape back to 普通新身体
  const switchToNormalResult = await evalJs(`(() => {
    const normalBtn = document.querySelector('button[data-v060-shape="normal"]');
    if (!normalBtn) return false;
    normalBtn.click();
    return true;
  })()`);
  assert.equal(switchToNormalResult, true, 'Normal shape button must exist and be clicked');
  await new Promise(r => setTimeout(r, 500));

  // Hard assert in Normal shape form after switching back: checked count strictly 0!
  const normalInheritanceStateAfterSwitch = await evalJs(`(() => {
    const form = document.querySelector('[data-s2-successor-form]');
    if (!form) return { error: 'successor-form-not-found' };
    const checkboxes = Array.from(form.querySelectorAll('input[type="checkbox"][name="inheritGroups"]'));
    return {
      total: checkboxes.length,
      checkedCount: checkboxes.filter(c => c.checked).length,
      selectedClassCount: form.querySelectorAll('.inheritance-card.selected').length
    };
  })()`);
  assert.ok(!normalInheritanceStateAfterSwitch.error, 'Normal shape successor form must exist');
  assert.equal(normalInheritanceStateAfterSwitch.total, 8, 'Normal shape must render 8 inheritance checkboxes');
  assert.equal(
    normalInheritanceStateAfterSwitch.checkedCount,
    0,
    'CRITICAL: Checked count after switching back to Normal shape MUST be strictly 0'
  );
  assert.equal(
    normalInheritanceStateAfterSwitch.selectedClassCount,
    0,
    'No inheritance-card element should have selected class in Normal shape'
  );
  console.log('[PASS] Hard Assertion 5: Death successor form empty inheritance preservation across shape switches strictly verified.');
  await evalJs(`(() => {
    const form = document.querySelector('[data-s2-successor-form]');
    if (form) form.scrollIntoView({ block: 'center', behavior: 'instant' });
  })()`);
  await new Promise(r => setTimeout(r, 200));
  await captureScreenshot('ux_post_death_successor_dark.png');

  console.log('--- Step 7: Hard Assertion 6 - Three themes switching, zero #ffffff cards in light, no #142033 metrics ---');
  // Switch to Light theme
  const switchLightResult = await evalJs(`(() => {
    const btn = document.querySelector('.wb-theme-btn[data-wb-theme="light"]');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  assert.equal(switchLightResult, true, 'Light theme button must exist');
  await new Promise(r => setTimeout(r, 500));

  const lightThemeCheck = await evalJs(`(() => {
    const root = document.querySelector('.battle-workbench-root');
    const lifePanel = document.querySelector('.unit-pc-life-host .pc-life-panel');
    const metric = document.querySelector('.pc-life-metric');
    const card = document.querySelector('.inheritance-card');
    const getBg = el => el ? window.getComputedStyle(el).backgroundColor : null;
    return {
      themeLightClass: root?.classList.contains('theme-light') || document.documentElement.dataset.theme === 'light',
      rootBg: getBg(root),
      lifePanelBg: getBg(lifePanel),
      metricBg: getBg(metric),
      cardBg: getBg(card)
    };
  })()`);
  assert.equal(lightThemeCheck.themeLightClass, true, 'Light theme class or attribute must be applied');
  assert.notEqual(lightThemeCheck.lifePanelBg, 'rgb(255, 255, 255)', 'Light theme pc-life-panel MUST NOT use #ffffff');
  assert.notEqual(lightThemeCheck.metricBg, 'rgb(20, 32, 51)', 'pc-life-metric MUST NOT use #142033 in light theme');
  if (lightThemeCheck.cardBg) {
    assert.notEqual(lightThemeCheck.cardBg, 'rgb(255, 255, 255)', 'inheritance-card MUST NOT use #ffffff in light theme');
  }
  await captureScreenshot('ux_theme_light.png');

  // Switch to Parchment theme
  const switchParchmentResult = await evalJs(`(() => {
    const btn = document.querySelector('.wb-theme-btn[data-wb-theme="parchment"]');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  assert.equal(switchParchmentResult, true, 'Parchment theme button must exist');
  await new Promise(r => setTimeout(r, 500));

  const parchmentThemeCheck = await evalJs(`(() => {
    const root = document.querySelector('.battle-workbench-root');
    const metric = document.querySelector('.pc-life-metric');
    const getBg = el => el ? window.getComputedStyle(el).backgroundColor : null;
    return {
      themeParchmentClass: root?.classList.contains('theme-parchment') || document.documentElement.dataset.theme === 'parchment',
      rootBg: getBg(root),
      metricBg: getBg(metric)
    };
  })()`);
  assert.equal(parchmentThemeCheck.themeParchmentClass, true, 'Parchment theme class or attribute must be applied');
  assert.notEqual(parchmentThemeCheck.metricBg, 'rgb(20, 32, 51)', 'pc-life-metric MUST NOT use #142033 in parchment theme');
  await captureScreenshot('ux_theme_parchment.png');

  // Switch back to Dark theme
  const switchDarkResult = await evalJs(`(() => {
    const btn = document.querySelector('.wb-theme-btn[data-wb-theme="dark"]');
    if (!btn) return false;
    btn.click();
    return true;
  })()`);
  assert.equal(switchDarkResult, true, 'Dark theme button must exist');
  await new Promise(r => setTimeout(r, 500));

  const darkThemeCheck = await evalJs(`(() => {
    const root = document.querySelector('.battle-workbench-root');
    const metric = document.querySelector('.pc-life-metric');
    const getBg = el => el ? window.getComputedStyle(el).backgroundColor : null;
    return {
      isDark: !root?.classList.contains('theme-light') && !root?.classList.contains('theme-parchment'),
      rootBg: getBg(root),
      metricBg: getBg(metric)
    };
  })()`);
  assert.equal(darkThemeCheck.isDark, true, 'Dark theme must be restored');
  assert.notEqual(darkThemeCheck.metricBg, 'rgb(20, 32, 51)', 'pc-life-metric MUST NOT use #142033 in dark theme');
  console.log('[PASS] Hard Assertion 6: Three themes switching and color constraints verified.');

  console.log('--- Step 8: Hard Assertion 7 - Desktop Asymmetric Layouts (Full, Combat, Resolution) via getBoundingClientRect ---');
  // First test Resolution Mode (PC is dead and currently selected)
  const resLayoutMetrics = await evalJs(`(() => {
    const getRect = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const left = document.querySelector('.wb-col-left');
    const center = document.querySelector('.wb-col-center');
    const right = document.querySelector('.wb-col-right');
    const root = document.querySelector('.battle-workbench-root');
    return {
      layoutState: root?.getAttribute('data-layout-state'),
      subMode: root?.getAttribute('data-submode'),
      leftRect: getRect(left),
      centerRect: getRect(center),
      rightRect: getRect(right)
    };
  })()`);
  assert.equal(resLayoutMetrics.layoutState, 'resolution', 'Dead PC focus must trigger resolution layoutState');
  assert.ok(resLayoutMetrics.centerRect.width > 0, 'Resolution Mode: Center Map must be visible and > 0px');
  assert.ok(
    resLayoutMetrics.rightRect.width > resLayoutMetrics.centerRect.width,
    `Resolution Mode: Right width (${resLayoutMetrics.rightRect.width}px) must be greater than Center Map (${resLayoutMetrics.centerRect.width}px)`
  );
  assert.ok(
    resLayoutMetrics.rightRect.width > resLayoutMetrics.leftRect.width,
    `Resolution Mode: Right width (${resLayoutMetrics.rightRect.width}px) must be greater than Left width (${resLayoutMetrics.leftRect.width}px)`
  );
  console.log(`[PASS] Resolution Mode widths: Left=${resLayoutMetrics.leftRect.width.toFixed(1)}px, Center=${resLayoutMetrics.centerRect.width.toFixed(1)}px, Right=${resLayoutMetrics.rightRect.width.toFixed(1)}px (Right is greatest).`);

  // Switch to non-dead combatant (火巨人) to test normal Full and Combat modes
  await evalJs(`(() => {
    const cards = Array.from(document.querySelectorAll('[data-select-card]'));
    const monsterCard = cards.find(card => card.textContent.includes('巨人'));
    if (monsterCard) monsterCard.click();
  })()`);
  await new Promise(r => setTimeout(r, 400));

  // Click 'full' mode button
  await evalJs(`(() => {
    const fullBtn = document.querySelector('.wb-mode-btn[data-wb-mode="full"]');
    if (fullBtn) fullBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const fullLayoutMetrics = await evalJs(`(() => {
    const getRect = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const left = document.querySelector('.wb-col-left');
    const center = document.querySelector('.wb-col-center');
    const right = document.querySelector('.wb-col-right');
    const root = document.querySelector('.battle-workbench-root');
    return {
      layoutState: root?.getAttribute('data-layout-state'),
      leftRect: getRect(left),
      centerRect: getRect(center),
      rightRect: getRect(right)
    };
  })()`);
  assert.equal(fullLayoutMetrics.layoutState, 'full', 'Full submode must trigger full layoutState');
  assert.ok(
    fullLayoutMetrics.centerRect.width > fullLayoutMetrics.leftRect.width,
    `Full Mode: Center Map (${fullLayoutMetrics.centerRect.width}px) must be greater than Left (${fullLayoutMetrics.leftRect.width}px)`
  );
  assert.ok(
    fullLayoutMetrics.centerRect.width > fullLayoutMetrics.rightRect.width,
    `Full Mode: Center Map (${fullLayoutMetrics.centerRect.width}px) must be greater than Right (${fullLayoutMetrics.rightRect.width}px)`
  );
  console.log(`[PASS] Full Mode widths: Left=${fullLayoutMetrics.leftRect.width.toFixed(1)}px, Center=${fullLayoutMetrics.centerRect.width.toFixed(1)}px, Right=${fullLayoutMetrics.rightRect.width.toFixed(1)}px (Center Map is greatest).`);

  // Click 'combat' mode button
  await evalJs(`(() => {
    const combatBtn = document.querySelector('.wb-mode-btn[data-wb-mode="combat"]');
    if (combatBtn) combatBtn.click();
  })()`);
  await new Promise(r => setTimeout(r, 500));

  const combatLayoutMetrics = await evalJs(`(() => {
    const getRect = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
    };
    const left = document.querySelector('.wb-col-left');
    const center = document.querySelector('.wb-col-center');
    const right = document.querySelector('.wb-col-right');
    const root = document.querySelector('.battle-workbench-root');
    return {
      layoutState: root?.getAttribute('data-layout-state'),
      leftRect: getRect(left),
      centerRect: getRect(center),
      rightRect: getRect(right)
    };
  })()`);
  assert.equal(combatLayoutMetrics.layoutState, 'combat', 'Combat submode must trigger combat layoutState');
  assert.ok(combatLayoutMetrics.centerRect.width > 0, 'Combat Mode: Center Map MUST remain visible and > 0px');
  assert.ok(
    combatLayoutMetrics.rightRect.width > combatLayoutMetrics.leftRect.width * 1.15,
    `Combat Mode: Right width (${combatLayoutMetrics.rightRect.width}px) must be significantly greater than Left width (${combatLayoutMetrics.leftRect.width}px)`
  );
  console.log(`[PASS] Combat Mode widths: Left=${combatLayoutMetrics.leftRect.width.toFixed(1)}px, Center=${combatLayoutMetrics.centerRect.width.toFixed(1)}px, Right=${combatLayoutMetrics.rightRect.width.toFixed(1)}px (Center map preserved, Right > Left).`);

  console.log('--- Step 9: Hard Assertion 8 - Multi-Viewport Testing (1440, 1280, 1024, 768, 390, 320px) ---');
  const targetViewports = [1440, 1280, 1024, 768, 390, 320];

  for (const vp of targetViewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp,
      height: 900,
      deviceScaleFactor: 1,
      mobile: vp < 768
    });
    await new Promise(r => setTimeout(r, 500));

    const vpMetrics = await evalJs(`(() => {
      const getRect = el => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      };
      const docScrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      const winWidth = window.innerWidth;
      const container = document.querySelector('.wb-layout-container') || document.querySelector('.battle-workbench-root');
      const center = document.querySelector('.wb-col-center');
      const right = document.querySelector('.wb-col-right');
      const left = document.querySelector('.wb-col-left');
      const containerRect = getRect(container);
      const centerRect = getRect(center);
      const rightRect = getRect(right);
      const leftRect = getRect(left);
      return {
        docScrollWidth,
        bodyScrollWidth,
        winWidth,
        containerRect,
        centerRect,
        rightRect,
        leftRect,
        hasOverflow: docScrollWidth > winWidth + 1 || bodyScrollWidth > winWidth + 1
      };
    })()`);

    assert.equal(
      vpMetrics.hasOverflow,
      false,
      `Horizontal overflow detected at ${vp}px: docScrollWidth=${vpMetrics.docScrollWidth}, winWidth=${vpMetrics.winWidth}`
    );

    // For viewports <= 1024 (768px~1050px and mobile): check vertical single-column order: Map -> Right -> Left
    if (vpMetrics.containerRect.width <= 900) {
      assert.ok(
        vpMetrics.centerRect.top < vpMetrics.rightRect.top,
        `Viewport ${vp}px: Map (top=${vpMetrics.centerRect.top}) must stack above Right (top=${vpMetrics.rightRect.top})`
      );
      assert.ok(
        vpMetrics.rightRect.top < vpMetrics.leftRect.top,
        `Viewport ${vp}px: Right (top=${vpMetrics.rightRect.top}) must stack above Left (top=${vpMetrics.leftRect.top})`
      );
      const targetContainerWidth = vpMetrics.containerRect ? vpMetrics.containerRect.width : vp;
      assert.ok(
        vpMetrics.centerRect.width >= targetContainerWidth - 4,
        `Viewport ${vp}px: Map must be full-width of layout container (actual ${vpMetrics.centerRect.width}px vs ${targetContainerWidth}px)`
      );
      assert.ok(
        vpMetrics.rightRect.width >= targetContainerWidth - 4,
        `Viewport ${vp}px: Right must be full-width of layout container (actual ${vpMetrics.rightRect.width}px vs ${targetContainerWidth}px)`
      );
    }

    if (vp === 390) {
      await captureScreenshot('ux_mobile_390px.png');
    }

    console.log(`[PASS] Viewport ${vp}px: zero horizontal overflow, stacking verified.`);
  }


  console.log('--- Additional acceptance: pointer gestures, collapsed tracks, dice and themes ---');
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
  await evalJs("window.scrollTo(0,0); document.querySelector('[data-wb-mode=full]').click()");
  await new Promise(r=>setTimeout(r,250));
  const geometry = async () => evalJs(`(() => {const rect=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};return {layout:rect('.wb-layout-container'),left:rect('.wb-col-left'),center:rect('.wb-col-center'),right:rect('.wb-col-right'),display:getComputedStyle(document.querySelector('.wb-layout-container')).display,mode:document.querySelector('[data-battle-workbench]').dataset.submode};})()`);
  let g=await geometry();
  assert.equal(g.display,'grid','1280 desktop must retain three columns');
  assert.ok(Math.abs(g.left.width/g.layout.width-.2)<.002);
  const snapshot=()=>evalJs("localStorage.getItem('dnd-terminal.v0.7.0.workbench.session.current')");
  const domainBefore=await snapshot();
  const dragHandle=async(touch=false)=>{
    const r=await evalJs("(()=>{const r=document.querySelector('[data-map-pan-handle]').getBoundingClientRect();const v=document.querySelector('[data-map-viewport]');return {x:r.x+100,y:r.y+15,left:v.scrollLeft,top:v.scrollTop}})()");
    if(touch){
      await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});
      await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x-55,y:r.y-25}]});
      await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await send('Emulation.setTouchEmulationEnabled',{enabled:false});
    } else {
      await send('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',buttons:1,clickCount:1});
      await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:r.x-80,y:r.y-35,button:'left',buttons:1});
      await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x-80,y:r.y-35,button:'left',clickCount:1});
    }
    const after=await evalJs("(()=>{const v=document.querySelector('[data-map-viewport]');return {left:v.scrollLeft,top:v.scrollTop}})()");
    if(after.left===r.left) await captureScreenshot('pan-failure.png');
    assert.ok(after.left>r.left+20 && after.top>r.top+10, 'handle must pan in both axes '+JSON.stringify({r,after}));
    assert.equal(await snapshot(),domainBefore,'pan must not mutate combat session');
  };
  await dragHandle(); await dragHandle(true);
  const clickBlank=async()=>{
    const r=await evalJs(`(()=>{const v=document.querySelector('[data-map-viewport]').getBoundingClientRect();const cells=[...document.querySelectorAll('[data-cell]')];const e=cells.find(e=>{const r=e.getBoundingClientRect();return !e.children.length&&r.x>v.x+5&&r.right<v.right-5&&r.y>v.y+5&&r.bottom<Math.min(v.bottom,innerHeight)-5});if(!e)throw Error('no visible blank cell');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',...r,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',...r,button:'left',clickCount:1});
    await new Promise(r=>setTimeout(r,250));
  };
  await clickBlank(); assert.equal((await geometry()).mode,'map');
  await clickBlank(); assert.equal((await geometry()).mode,'full');
  await evalJs("document.querySelector('[data-wb-mode=combat]').click()");
  await clickBlank(); assert.equal((await geometry()).mode,'map');
  await clickBlank(); assert.equal((await geometry()).mode,'combat');
  assert.equal(await snapshot(),domainBefore,'background navigation must not mutate combat session');
  await evalJs("document.querySelector('.combatant.dead').click()");
  await new Promise(r=>setTimeout(r,250));
  g=await geometry(); assert.ok(g.right.width>0,'death workflow opens inspector');
  await evalJs("document.querySelector('[data-wb-collapse=left]').click();document.querySelector('[data-wb-collapse=right]').click()");
  await new Promise(r=>setTimeout(r,250));
  g=await geometry();
  assert.ok(Math.abs(g.center.width-(g.layout.width-88))<2,'collapsed death tracks must release all space');
  await evalJs("document.querySelector('[data-wb-expand=left]').click();document.querySelector('[data-wb-expand=right]').click()");
  await evalJs("document.querySelector('[data-header-toggle]').click()");
  for(const theme of ['light','parchment','dark']){
    await evalJs("document.querySelector('[data-wb-theme="+theme+"]').click();window.scrollTo(0,0)");
    for(const width of [320,390,768,1024,1280,1440]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
      await new Promise(r=>setTimeout(r,80));
      const m=await evalJs(`(()=>{const h=document.querySelector('[data-workbench-topbar]').getBoundingClientRect();const bad=[...document.querySelectorAll('[data-wb-dice-dock] button,[data-wb-dice-dock] input,[data-wb-dice-dock] select')].filter(e=>{const r=e.getBoundingClientRect();return r.width&& (r.right>h.right+1||r.bottom>h.bottom+1||r.left<h.left-1)}).map(e=>e.className);const s=getComputedStyle(document.querySelector('.death-pill'));return {bad,width:innerWidth,scroll:document.documentElement.scrollWidth,color:s.color,bg:s.backgroundColor}})()`);
      assert.deepEqual(m.bad,[],'dice controls contained '+theme+' '+width+JSON.stringify(m));
      if(m.scroll>m.width+1){
        console.log('overflow elements',await evalJs("JSON.stringify([...document.querySelectorAll('body *')].filter(e=>{let r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+1&&!e.closest('[data-map-viewport],.wb-ribbon-track')}).map(e=>({tag:e.tagName,class:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right,scroll:e.scrollWidth,client:e.clientWidth})).slice(0,40))"));
        await captureScreenshot('overflow-'+theme+'-'+width+'.png');
      }
      assert.ok(m.scroll<=m.width+1,'overflow '+theme+' '+width+' '+JSON.stringify(m));
      const luminance=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
      const l1=luminance(m.color),l2=luminance(m.bg);
      assert.ok((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)>=4.5,'death label contrast '+theme);
    }
    await captureScreenshot('final-'+theme+'-1440.png');
  }
  console.log('[PASS] mouse/touch pan; background return navigation; 44px collapsed rails; 18 theme/width cases; death-label contrast; domain unchanged');

  console.log('--- Step 10: Hard Assertion 9 - Console error audit ---');
  assert.equal(
    consoleErrors.length,
    0,
    `Console errors detected during execution (${consoleErrors.length}):\n${consoleErrors.join('\n')}`
  );
  console.log('[PASS] Hard Assertion 9: Console error audit passed (0 errors).');

  console.log('\n========================================');
  console.log('ALL HARD ASSERTIONS PASSED SUCCESSFULLY.');
  console.log('========================================\n');
  process.exitCode = 0;
} catch (error) {
  console.error('\n========================================');
  console.error('VERIFICATION FAILED WITH ERROR:');
  console.error(error);
  console.error('========================================\n');
  process.exitCode = 1;
} finally {
  if (ws) ws.close();
  chrome.kill();
}
