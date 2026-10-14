/**
 * Crossword Universal Engine & Master System Rebuild
 * High-precision luxury architecture, UK daily release timing,
 * authoritative network synchronization, and resilient mobile UX.
 * Rebranded with professional botanical cannabis visual presentation.
 */

(() => {
  'use strict';

  // Config & Constants
  const CSV_DATA_PATH = './puzzles.csv';
  const STORAGE_KEY_NAMESPACE = 'cannacrossword_game_universal_v1';
  const TIME_API_ENDPOINT = 'https://worldtimeapi.org/api/timezone/Europe/London';
  const HOME_PAGE_URL = 'https://tileworksgamesstudio.github.io/CannaGames-Home/'; // Project owner external portal placeholder

  // Exact Verbatim Cannabis Leaf Graphic Asset (Section 8 Mandate)
  const CANNABIS_LEAF_SVG = `<svg xmlns="http://w3.org" viewBox="0 0 512 546" width="512" height="546">
  <g fill="#2e7d32">
    <!-- Center / Main Leaf Blade -->
    <path d="M256,20 C240,100 245,180 256,260 C267,180 272,100 256,20 Z" />
    <!-- Upper Side Lobes -->
    <path d="M256,260 C210,140 140,100 80,110 C140,160 200,230 256,260 Z" />
    <path d="M256,260 C302,140 372,100 432,110 C372,160 312,230 256,260 Z" />
    <!-- Middle Side Lobes -->
    <path d="M256,260 C180,200 100,210 50,250 C110,280 180,290 256,260 Z" />
    <path d="M256,260 C332,200 412,210 462,250 C402,280 332,290 256,260 Z" />
    <!-- Lower Side Lobes -->
    <path d="M256,260 C190,270 130,310 90,360 C140,360 200,340 256,260 Z" />
    <path d="M256,260 C322,270 382,310 422,360 C372,360 312,340 256,260 Z" />
    <!-- Stem / Petiole -->
    <path d="M246,260 L246,510 L266,510 L266,260 Z" />
  </g>
</svg>`;

  // Ambient Icon Pool using the exact SVG
  const AMBIENT_ICONS = [CANNABIS_LEAF_SVG];

  // Defensive Global Application State
  const state = {
    records: [],
    dates: [],
    todayUKDate: '',
    selectedDailyTier: 'mini',
    activeDate: '',
    activeTier: '',
    currentPuzzle: null,
    userGrid: [],
    cursor: { r: 0, c: 0 },
    direction: 'across',
    timerSeconds: 0,
    timerInterval: null,
    isSolved: false,

    // Time Authority Sync
    timeOffsetMs: 0,
    isTimeSynced: false,

    // Preferences & Local Data
    settings: {
      backgroundAnimation: true
    },
    saveData: {
      stats: {
        played: 0,
        solved: 0,
        streak: 0,
        bestStreak: 0,
        times: { mini: [], midi: [], main: [] }
      },
      inProgress: {},
      history: {}
    }
  };

  // DOM Elements Map
  const el = {
    siteHeader: document.getElementById('site-header'),
    btnHeaderHome: document.getElementById('btn-header-home'),
    headerGameMeta: document.getElementById('header-game-meta'),
    gameTimer: document.getElementById('game-timer'),
    btnGameHelp: document.getElementById('btn-game-help'),

    screenMenu: document.getElementById('screen-menu'),
    screenGame: document.getElementById('screen-game'),
    screenVault: document.getElementById('screen-vault'),
    screenError: document.getElementById('screen-error'),
    errorMessage: document.getElementById('error-message'),
    btnRetryLoad: document.getElementById('btn-retry-load'),

    dailyDateLabel: document.getElementById('daily-date-label'),
    dailyTierSelector: document.getElementById('daily-tier-selector'),
    btnPlayGame: document.getElementById('btn-play-game'),
    btnPlayLabel: document.getElementById('btn-play-label'),
    btnMenuVault: document.getElementById('btn-menu-vault'),
    btnMenuSettings: document.getElementById('btn-menu-settings'),
    btnMenuHelp: document.getElementById('btn-menu-help'),

    btnUtilStats: document.getElementById('btn-util-stats'),
    btnUtilShare: document.getElementById('btn-util-share'),
    btnUtilPlus: document.getElementById('btn-util-plus'),

    gameActiveTitle: document.getElementById('game-active-title'),
    btnGameBack: document.getElementById('btn-game-back'),
    gameTierTabs: document.getElementById('game-tier-tabs'),
    activeClueTrigger: document.getElementById('active-clue-trigger'),
    activeClueBadge: document.getElementById('active-clue-badge'),
    activeClueText: document.getElementById('active-clue-text'),
    crosswordBoard: document.getElementById('crossword-board'),
    cluesListAcross: document.getElementById('clues-list-across'),
    cluesListDown: document.getElementById('clues-list-down'),
    onscreenKeyboard: document.getElementById('onscreen-keyboard'),

    vaultList: document.getElementById('vault-list'),
    btnVaultBack: document.getElementById('btn-vault-back'),

    panelHowToPlayOverlay: document.getElementById('panel-howtoplay-overlay'),
    panelHelpBackdrop: document.getElementById('panel-help-backdrop'),
    btnCloseHelp: document.getElementById('btn-close-help'),

    modalSettings: document.getElementById('modal-settings'),
    optAnimOn: document.getElementById('opt-anim-on'),
    optAnimOff: document.getElementById('opt-anim-off'),

    modalStats: document.getElementById('modal-stats'),
    statPlayed: document.getElementById('stat-played'),
    statSolved: document.getElementById('stat-solved'),
    statStreak: document.getElementById('stat-streak'),
    statBest: document.getElementById('stat-best'),
    statsTierTimes: document.getElementById('stats-tier-times'),

    modalVictory: document.getElementById('modal-victory'),
    victorySummaryText: document.getElementById('victory-summary-text'),
    btnVictoryAction: document.getElementById('btn-victory-action'),

    toastMessage: document.getElementById('toast-message'),
    bgIconStage: document.getElementById('bg-icon-stage')
  };

  /* ==========================================================================
     TIME SYNCHRONIZATION & UK RELEASE SYSTEM
     Uses network date headers or WorldTimeAPI to prevent local clock spoofing.
     Release timezone: Europe/London with exact DST handling.
     ========================================================================== */

  async function syncAuthoritativeTime() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Attempt 1: Fetch from WorldTimeAPI Europe/London
      const res = await fetch(TIME_API_ENDPOINT, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const serverEpoch = new Date(data.utc_datetime).getTime();
        state.timeOffsetMs = serverEpoch - Date.now();
        state.isTimeSynced = true;
      } else {
        throw new Error('WorldTimeAPI status not OK');
      }
    } catch (e) {
      // Fallback: Use HTTP response Date header of CSV fetch
      try {
        const headRes = await fetch(CSV_DATA_PATH, { method: 'HEAD', cache: 'no-store' });
        const dateHeader = headRes.headers.get('date');
        if (dateHeader) {
          const headerEpoch = new Date(dateHeader).getTime();
          state.timeOffsetMs = headerEpoch - Date.now();
          state.isTimeSynced = true;
        }
      } catch (fallbackErr) {
        console.warn('Network time sync unavailable; falling back to monotonic local reference.');
      }
    }

    state.todayUKDate = calculateUKReleaseDate();
  }

  function calculateUKReleaseDate() {
    const authoritativeEpoch = Date.now() + state.timeOffsetMs;
    // Format into Europe/London calendar string (YYYY-MM-DD)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date(authoritativeEpoch));
  }

  /* ==========================================================================
     PERSISTENCE & DEFENSIVE STORAGE
     ========================================================================== */

  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NAMESPACE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.settings && typeof parsed.settings === 'object') {
            state.settings = { ...state.settings, ...parsed.settings };
          }
          if (parsed.stats && typeof parsed.stats === 'object') {
            state.saveData.stats = { ...state.saveData.stats, ...parsed.stats };
          }
          if (parsed.history && typeof parsed.history === 'object') {
            state.saveData.history = { ...parsed.history };
          }
          if (parsed.inProgress && typeof parsed.inProgress === 'object') {
            state.saveData.inProgress = { ...parsed.inProgress };
          }
        }
      }
    } catch (e) {
      console.warn('Local storage inaccessible or empty. Starting fresh.');
    }
  }

  function saveStorage() {
    try {
      const payload = {
        settings: state.settings,
        stats: state.saveData.stats,
        history: state.saveData.history,
        inProgress: state.saveData.inProgress
      };
      localStorage.setItem(STORAGE_KEY_NAMESPACE, JSON.stringify(payload));
    } catch (e) {
      console.warn('Unable to persist data to local storage.');
    }
  }

  /* ==========================================================================
     CSV PARSER
     ========================================================================== */

  function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (inQuotes) {
        if (char === '"' && nextChar === '"') { cell += '"'; i++; }
        else if (char === '"') { inQuotes = false; }
        else { cell += char; }
      } else {
        if (char === '"') { inQuotes = true; }
        else if (char === ',') { row.push(cell.trim()); cell = ''; }
        else if (char === '\n' || char === '\r') {
          if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
          row = []; cell = '';
          if (char === '\r' && nextChar === '\n') i++;
        } else { cell += char; }
      }
    }
    if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
    if (!rows.length) return [];

    const headers = rows[0].map(h => h.toLowerCase());
    return rows.slice(1).map(cols => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = cols[idx] || ''; });
      return obj;
    });
  }

  /* ==========================================================================
     ATMOSPHERIC BACKGROUND CANNABIS LEAF ENGINE
     Organic bottom-to-top floating drift, 3 distinct depth planes,
     dynamic recycling, toggleable setting.
     ========================================================================== */

  class AmbientBackgroundEngine {
    constructor(container) {
      this.container = container;
      this.particles = [];
      this.isActive = true;
      this.animId = null;
      this.lastSpawn = 0;
      this.spawnInterval = 3400; // ms
      this.maxParticles = 8;
    }

    start() {
      if (!this.isActive) return;
      this.loop = this.loop.bind(this);
      this.animId = requestAnimationFrame(this.loop);
    }

    stop() {
      if (this.animId) cancelAnimationFrame(this.animId);
      this.animId = null;
      this.container.innerHTML = '';
      this.particles = [];
    }

    spawnParticle() {
      if (this.particles.length >= this.maxParticles) return;

      const el = document.createElement('div');
      el.className = 'ambient-icon';
      el.innerHTML = AMBIENT_ICONS[0];

      // Depth layer determination
      const depthRoll = Math.random();
      let depthClass = 'depth-mid';
      let speed = 0.28 + Math.random() * 0.2;
      let scale = 0.85 + Math.random() * 0.25;

      if (depthRoll < 0.45) {
        depthClass = 'depth-back';
        speed = 0.18 + Math.random() * 0.12;
        scale = 0.65 + Math.random() * 0.2;
      } else if (depthRoll > 0.8) {
        depthClass = 'depth-fore';
        speed = 0.38 + Math.random() * 0.24;
        scale = 1.05 + Math.random() * 0.25;
      }

      el.classList.add(depthClass);

      const x = 5 + Math.random() * 90; // vw
      const startY = window.innerHeight + 60;
      const baseRotation = (Math.random() - 0.5) * 40; // subtle natural tilt in degrees

      this.container.appendChild(el);

      this.particles.push({
        el,
        x,
        y: startY,
        speed,
        scale,
        rotation: baseRotation,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        driftSpeed: (Math.random() - 0.5) * 0.15,
        driftPhase: Math.random() * Math.PI * 2
      });
    }

    loop(timestamp) {
      if (!this.isActive) return;

      if (timestamp - this.lastSpawn > this.spawnInterval) {
        this.spawnParticle();
        this.lastSpawn = timestamp;
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.y -= p.speed;
        p.driftPhase += 0.015;
        p.rotation += p.rotSpeed;
        const currentX = p.x + Math.sin(p.driftPhase) * 1.8;

        p.el.style.transform = `translate3d(${currentX}vw, ${p.y}px, 0) scale(${p.scale}) rotate(${p.rotation}deg)`;

        // Recycle when passing safely off top
        if (p.y < -90) {
          p.el.remove();
          this.particles.splice(i, 1);
        }
      }

      this.animId = requestAnimationFrame(this.loop);
    }
  }

  let bgEngine = null;

  function initBackgroundAtmosphere() {
    bgEngine = new AmbientBackgroundEngine(el.bgIconStage);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (state.settings.backgroundAnimation && !prefersReducedMotion) {
      bgEngine.start();
    }
  }

  function setBackgroundAnimation(enabled) {
    state.settings.backgroundAnimation = enabled;
    saveStorage();

    el.optAnimOn.classList.toggle('active', enabled);
    el.optAnimOn.setAttribute('aria-checked', String(enabled));
    el.optAnimOff.classList.toggle('active', !enabled);
    el.optAnimOff.setAttribute('aria-checked', String(!enabled));

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (enabled && !prefersReducedMotion) {
      if (!bgEngine.animId) bgEngine.start();
    } else {
      bgEngine.stop();
    }
  }

  /* ==========================================================================
     APP INITIALIZATION & SCREEN ROUTING
     ========================================================================== */

  async function init() {
    try {
      loadStorage();
      bindEvents();
      initBackgroundAtmosphere();

      const res = await fetch(CSV_DATA_PATH, { cache: 'no-store' });
      if (!res.ok) throw new Error('Network error loading crossword data.');
      const text = await res.text();
      const records = parseCSV(text);

      state.records = records.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && r.grid);
      if (!state.records.length) throw new Error('No valid crossword puzzle records found.');

      state.dates = [...new Set(state.records.map(r => r.date))].sort();

      // Synchronize with authoritative UK release clock
      await syncAuthoritativeTime();

      // Puzzles dated > todayUKDate remain locked
      const availableDates = state.dates.filter(d => d <= state.todayUKDate);
      state.todayDate = availableDates.length ? availableDates[availableDates.length - 1] : state.dates[0];

      renderMenu();
      showScreen('menu');
    } catch (err) {
      showError(err.message || 'Unable to load puzzle records.');
    }
  }

  function showError(msg) {
    el.errorMessage.textContent = msg;
    showScreen('error');
  }

  function showScreen(screen) {
    el.screenMenu.classList.toggle('hidden', screen !== 'menu');
    el.screenGame.classList.toggle('hidden', screen !== 'game');
    el.screenVault.classList.toggle('hidden', screen !== 'vault');
    el.screenError.classList.toggle('hidden', screen !== 'error');

    // In-game header meta controls
    el.headerGameMeta.classList.toggle('active', screen === 'game');
  }

  /* ==========================================================================
     SCREEN 1: MAIN MENU RENDERING
     ========================================================================== */

  function renderMenu() {
    el.dailyDateLabel.textContent = `Daily Puzzle · ${formatDate(state.todayDate)}`;
    el.dailyTierSelector.innerHTML = '';

    const todayTiers = state.records.filter(r => r.date === state.todayDate);
    if (!todayTiers.length) return;

    if (!todayTiers.some(t => t.tier === state.selectedDailyTier)) {
      state.selectedDailyTier = todayTiers[0].tier;
    }

    todayTiers.forEach(item => {
      const isDone = !!state.saveData.history[`${state.todayDate}_${item.tier}`]?.solved;
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `tier-pill ${item.tier === state.selectedDailyTier ? 'selected' : ''}`;
      pill.innerHTML = `<span>${item.tier}</span>${isDone ? ' &#x2713;' : ''}`;
      pill.addEventListener('click', () => {
        state.selectedDailyTier = item.tier;
        renderMenu();
      });
      el.dailyTierSelector.appendChild(pill);
    });

    const isCurrentSolved = !!state.saveData.history[`${state.todayDate}_${state.selectedDailyTier}`]?.solved;
    const tierDisplay = state.selectedDailyTier.charAt(0).toUpperCase() + state.selectedDailyTier.slice(1);
    el.btnPlayLabel.textContent = isCurrentSolved
      ? `Review ${tierDisplay} Crossword`
      : `Play ${tierDisplay} Crossword`;
  }

  /* ==========================================================================
     SCREEN 3: VAULT ARCHIVE
     Excludes future and today's released puzzle.
     ========================================================================== */

  function renderVault() {
    el.vaultList.innerHTML = '';
    const historicalDates = state.dates.filter(d => d < state.todayDate).reverse();

    if (!historicalDates.length) {
      el.vaultList.innerHTML = '<p style="text-align: center; color: var(--color-highlight); padding: 36px;">No historical puzzles in the vault yet.</p>';
      return;
    }

    historicalDates.forEach(date => {
      const dayTiers = state.records.filter(r => r.date === date);
      const card = document.createElement('article');
      card.className = 'vault-card';

      const badges = dayTiers.map(t => {
        const done = !!state.saveData.history[`${date}_${t.tier}`]?.solved;
        return `<span class="vault-tier-badge ${done ? 'completed' : ''}">${t.tier}${done ? ' &#x2713;' : ''}</span>`;
      }).join('');

      card.innerHTML = `
        <span class="vault-date">${formatDate(date)}</span>
        <div class="vault-badges">${badges}</div>
      `;

      card.addEventListener('click', () => {
        loadPuzzle(date, dayTiers[0].tier);
      });

      el.vaultList.appendChild(card);
    });
  }

  /* ==========================================================================
     GRID & CLUE PARSER ENGINE
     ========================================================================== */

  function parsePuzzleModel(record) {
    const rawLines = record.grid.split(/[\/\r\n]+/).map(s => s.trim()).filter(Boolean);
    const size = rawLines.length;
    const solution = [];
    const blocks = new Set();

    for (let r = 0; r < size; r++) {
      solution[r] = [];
      for (let c = 0; c < size; c++) {
        const char = (rawLines[r][c] || '#').toUpperCase();
        if (char === '#') blocks.add(`${r},${c}`);
        solution[r][c] = char;
      }
    }

    let counter = 1;
    const numbering = {};
    const wordsAcross = [];
    const wordsDown = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (blocks.has(`${r},${c}`)) continue;
        const needsAcross = (c === 0 || blocks.has(`${r},${c - 1}`)) && (c + 1 < size && !blocks.has(`${r},${c + 1}`));
        const needsDown = (r === 0 || blocks.has(`${r - 1},${c}`)) && (r + 1 < size && !blocks.has(`${r + 1},${c}`));

        if (needsAcross || needsDown) {
          numbering[`${r},${c}`] = counter;
          if (needsAcross) wordsAcross.push(counter);
          if (needsDown) wordsDown.push(counter);
          counter++;
        }
      }
    }

    const parseClueList = (str, wordNums) => {
      if (!str) return [];
      const lines = str.split(/\r?\n|\|/).map(s => s.trim()).filter(Boolean);
      return lines.map((line, idx) => {
        const match = line.match(/^(\d+)[\.\:\-]?\s*(.+)$/);
        if (match) return { num: parseInt(match[1], 10), clue: match[2].trim() };
        return { num: wordNums[idx] || (idx + 1), clue: line };
      });
    };

    return {
      size,
      solution,
      blocks,
      numbering,
      clues: {
        across: parseClueList(record.clues_across, wordsAcross),
        down: parseClueList(record.clues_down, wordsDown)
      },
      title: record.title || 'Daily Crossword',
      date: record.date,
      tier: record.tier
    };
  }

  function isBlock(r, c) {
    const p = state.currentPuzzle;
    if (r < 0 || c < 0 || r >= p.size || c >= p.size) return true;
    return p.blocks.has(`${r},${c}`);
  }

  /* ==========================================================================
     GAMEPLAY STATE & INTERACTION
     Single-tap cell interaction, zero double-tap lag, automatic orientation.
     ========================================================================== */

  function loadPuzzle(date, tier) {
    const record = state.records.find(r => r.date === date && r.tier === tier);
    if (!record) return;

    state.activeDate = date;
    state.activeTier = tier;
    state.currentPuzzle = parsePuzzleModel(record);

    const size = state.currentPuzzle.size;
    state.userGrid = Array.from({ length: size }, () => Array(size).fill(''));
    state.isSolved = false;
    state.timerSeconds = 0;

    const puzzleKey = `${date}_${tier}`;
    const savedSolved = state.saveData.history[puzzleKey];
    const savedInProgress = state.saveData.inProgress[puzzleKey];

    if (savedSolved?.solved) {
      state.isSolved = true;
      state.timerSeconds = savedSolved.time || 0;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          state.userGrid[r][c] = state.currentPuzzle.solution[r][c];
        }
      }
    } else if (savedInProgress) {
      state.timerSeconds = savedInProgress.time || 0;
      if (Array.isArray(savedInProgress.grid)) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            state.userGrid[r][c] = savedInProgress.grid[r]?.[c] || '';
          }
        }
      }
    }

    renderGameHeader();
    renderBoard();
    renderClues();
    resetCursor();

    showScreen('game');
    updateTimerDisplay();

    clearInterval(state.timerInterval);
    if (!state.isSolved) {
      state.timerInterval = setInterval(() => {
        state.timerSeconds++;
        updateTimerDisplay();
        persistInProgressState();
      }, 1000);
    }
  }

  function renderGameHeader() {
    el.gameActiveTitle.textContent = `${state.currentPuzzle.title} · ${state.activeTier.toUpperCase()}`;
    el.gameTierTabs.innerHTML = '';
    const dayTiers = state.records.filter(r => r.date === state.activeDate);

    dayTiers.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tier-tab-pill ${t.tier === state.activeTier ? 'active' : ''}`;
      const isDone = !!state.saveData.history[`${state.activeDate}_${t.tier}`]?.solved;
      btn.innerHTML = `${t.tier}${isDone ? ' &#x2713;' : ''}`;
      btn.addEventListener('click', () => loadPuzzle(state.activeDate, t.tier));
      el.gameTierTabs.appendChild(btn);
    });
  }

  function renderBoard() {
    const size = state.currentPuzzle.size;
    const grid = el.crosswordBoard;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.setAttribute('role', 'gridcell');

        if (isBlock(r, c)) {
          cell.classList.add('cell-black');
          cell.setAttribute('aria-hidden', 'true');
        } else {
          const num = state.currentPuzzle.numbering[`${r},${c}`];
          if (num) {
            const numEl = document.createElement('span');
            numEl.className = 'cell-num';
            numEl.textContent = num;
            cell.appendChild(numEl);
          }
          const letter = state.userGrid[r][c];
          if (letter) {
            const letterEl = document.createElement('span');
            letterEl.className = 'cell-letter';
            letterEl.textContent = letter;
            cell.appendChild(letterEl);
          }

          // Direct pointerdown activation for responsive mobile solving
          cell.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            handleCellTap(r, c);
          });
        }
        grid.appendChild(cell);
      }
    }
  }

  function renderClues() {
    el.cluesListAcross.innerHTML = '';
    el.cluesListDown.innerHTML = '';

    const createClueNode = (item, dir) => {
      const li = document.createElement('li');
      li.className = 'clue-item';
      li.dataset.dir = dir;
      li.dataset.num = item.num;
      li.innerHTML = `<strong>${item.num}.</strong> ${item.clue}`;
      li.addEventListener('click', () => jumpToWord(item.num, dir));
      return li;
    };

    state.currentPuzzle.clues.across.forEach(c => el.cluesListAcross.appendChild(createClueNode(c, 'across')));
    state.currentPuzzle.clues.down.forEach(c => el.cluesListDown.appendChild(createClueNode(c, 'down')));
  }

  function handleCellTap(r, c) {
    if (isBlock(r, c)) return;
    if (state.cursor.r === r && state.cursor.c === c) {
      state.direction = state.direction === 'across' ? 'down' : 'across';
    } else {
      state.cursor = { r, c };
      if (!isValidDirection(r, c, state.direction)) {
        state.direction = state.direction === 'across' ? 'down' : 'across';
      }
    }
    updateSelection();
  }

  function isValidDirection(r, c, dir) {
    const size = state.currentPuzzle.size;
    if (dir === 'across') return (c > 0 && !isBlock(r, c - 1)) || (c + 1 < size && !isBlock(r, c + 1));
    return (r > 0 && !isBlock(r - 1, c)) || (r + 1 < size && !isBlock(r + 1, c));
  }

  function resetCursor() {
    const size = state.currentPuzzle.size;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isBlock(r, c)) {
          state.cursor = { r, c };
          state.direction = 'across';
          updateSelection();
          return;
        }
      }
    }
  }

  function getWordSpan(r, c, dir) {
    const span = [];
    const size = state.currentPuzzle.size;
    if (dir === 'across') {
      let sc = c; while (sc > 0 && !isBlock(r, sc - 1)) sc--;
      let ec = c; while (ec + 1 < size && !isBlock(r, ec + 1)) ec++;
      for (let cur = sc; cur <= ec; cur++) span.push({ r, c: cur });
    } else {
      let sr = r; while (sr > 0 && !isBlock(sr - 1, c)) sr--;
      let er = r; while (er + 1 < size && !isBlock(er + 1, c)) er++;
      for (let cur = sr; cur <= er; cur++) span.push({ r: cur, c });
    }
    return span;
  }

  function updateSelection() {
    const { r, c } = state.cursor;
    const size = state.currentPuzzle.size;
    const cells = el.crosswordBoard.children;

    for (let i = 0; i < cells.length; i++) {
      cells[i].classList.remove('cell-active', 'cell-word');
      cells[i].removeAttribute('aria-selected');
    }

    const span = getWordSpan(r, c, state.direction);
    span.forEach(pos => {
      const idx = pos.r * size + pos.c;
      if (cells[idx]) cells[idx].classList.add('cell-word');
    });

    const activeIdx = r * size + c;
    if (cells[activeIdx]) {
      cells[activeIdx].classList.add('cell-active');
      cells[activeIdx].setAttribute('aria-selected', 'true');
    }

    if (!span.length) return;
    const root = span[0];
    const num = state.currentPuzzle.numbering[`${root.r},${root.c}`];
    const clueObj = state.currentPuzzle.clues[state.direction].find(i => i.num === num);

    el.activeClueBadge.textContent = num ? `${num}${state.direction === 'across' ? 'A' : 'D'}` : '--';
    el.activeClueText.textContent = clueObj ? clueObj.clue : 'Select any cell to view clue.';

    document.querySelectorAll('.clue-item').forEach(item => {
      const matches = item.dataset.dir === state.direction && Number(item.dataset.num) === num;
      item.classList.toggle('active', matches);
      if (matches) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  function jumpToWord(num, dir) {
    for (const [coord, wordNum] of Object.entries(state.currentPuzzle.numbering)) {
      if (wordNum === num) {
        const [r, c] = coord.split(',').map(Number);
        state.cursor = { r, c };
        state.direction = dir;
        updateSelection();
        return;
      }
    }
  }

  function handleInput(char) {
    if (state.isSolved) return;
    char = char.toUpperCase();
    if (!/^[A-Z]$/.test(char)) return;

    const { r, c } = state.cursor;
    state.userGrid[r][c] = char;

    const size = state.currentPuzzle.size;
    const cellEl = el.crosswordBoard.children[r * size + c];
    let letterSpan = cellEl.querySelector('.cell-letter');
    if (!letterSpan) {
      letterSpan = document.createElement('span');
      letterSpan.className = 'cell-letter';
      cellEl.appendChild(letterSpan);
    }
    letterSpan.textContent = char;

    persistInProgressState();
    advanceCursor(false);
    checkWin();
  }

  function handleBackspace() {
    if (state.isSolved) return;
    const { r, c } = state.cursor;
    const size = state.currentPuzzle.size;

    if (state.userGrid[r][c]) {
      state.userGrid[r][c] = '';
      const letterSpan = el.crosswordBoard.children[r * size + c].querySelector('.cell-letter');
      if (letterSpan) letterSpan.remove();
    } else {
      advanceCursor(true);
      const pr = state.cursor.r;
      const pc = state.cursor.c;
      state.userGrid[pr][pc] = '';
      const pSpan = el.crosswordBoard.children[pr * size + pc].querySelector('.cell-letter');
      if (pSpan) pSpan.remove();
    }
    persistInProgressState();
    updateSelection();
  }

  function advanceCursor(backwards) {
    const size = state.currentPuzzle.size;
    let { r, c } = state.cursor;
    for (let step = 0; step < size; step++) {
      if (state.direction === 'across') c += backwards ? -1 : 1;
      else r += backwards ? -1 : 1;
      if (r < 0 || c < 0 || r >= size || c >= size) break;
      if (!isBlock(r, c)) {
        state.cursor = { r, c };
        break;
      }
    }
    updateSelection();
  }

  function persistInProgressState() {
    if (state.isSolved) return;
    const key = `${state.activeDate}_${state.activeTier}`;
    state.saveData.inProgress[key] = {
      grid: state.userGrid,
      time: state.timerSeconds
    };
    saveStorage();
  }

  function checkWin() {
    const size = state.currentPuzzle.size;
    const sol = state.currentPuzzle.solution;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isBlock(r, c) && state.userGrid[r][c] !== sol[r][c]) return false;
      }
    }

    state.isSolved = true;
    clearInterval(state.timerInterval);

    const histKey = `${state.activeDate}_${state.activeTier}`;
    delete state.saveData.inProgress[histKey];

    if (!state.saveData.history[histKey]) {
      state.saveData.history[histKey] = { solved: true, time: state.timerSeconds };
      state.saveData.stats.played++;
      state.saveData.stats.solved++;
      state.saveData.stats.streak++;
      if (state.saveData.stats.streak > state.saveData.stats.bestStreak) {
        state.saveData.stats.bestStreak = state.saveData.stats.streak;
      }
      if (!state.saveData.stats.times[state.activeTier]) state.saveData.stats.times[state.activeTier] = [];
      state.saveData.stats.times[state.activeTier].push(state.timerSeconds);
      saveStorage();
    }

    renderGameHeader();
    showVictoryModal();
    return true;
  }

  function showVictoryModal() {
    el.victorySummaryText.textContent = `Solved in ${formatTime(state.timerSeconds)}!`;
    const dayTiers = state.records.filter(r => r.date === state.activeDate);
    const currIdx = dayTiers.findIndex(t => t.tier === state.activeTier);
    const nextTier = dayTiers[currIdx + 1];

    if (nextTier) {
      el.btnVictoryAction.querySelector('.btn-text').textContent = `Play ${nextTier.tier.toUpperCase()}`;
      el.btnVictoryAction.onclick = () => {
        closeModal(el.modalVictory);
        loadPuzzle(state.activeDate, nextTier.tier);
      };
    } else {
      el.btnVictoryAction.querySelector('.btn-text').textContent = 'Back to Menu';
      el.btnVictoryAction.onclick = () => {
        closeModal(el.modalVictory);
        showScreen('menu');
        renderMenu();
      };
    }
    openModal(el.modalVictory);
  }

  /* ==========================================================================
     HOW TO PLAY PANEL (SLIDE-IN FROM RIGHT ONLY)
     ========================================================================== */

  function openHowToPlay() {
    el.panelHowToPlayOverlay.classList.remove('hidden');
    void el.panelHowToPlayOverlay.offsetWidth;
    el.panelHowToPlayOverlay.classList.add('active');
    el.panelHowToPlayOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeHowToPlay() {
    el.panelHowToPlayOverlay.classList.remove('active');
    el.panelHowToPlayOverlay.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      el.panelHowToPlayOverlay.classList.add('hidden');
    }, 450);
  }

  /* ==========================================================================
     STATISTICS, SETTINGS & UTILITY HANDLERS
     ========================================================================== */

  function openStatsModal() {
    const s = state.saveData.stats;
    el.statPlayed.textContent = s.played;
    el.statSolved.textContent = s.solved;
    el.statStreak.textContent = s.streak;
    el.statBest.textContent = s.bestStreak;

    el.statsTierTimes.innerHTML = '';
    ['mini', 'midi', 'main'].forEach(tier => {
      const times = s.times[tier] || [];
      const med = times.length ? formatTime([...times].sort((a, b) => a - b)[Math.floor(times.length / 2)]) : '--:--';
      const li = document.createElement('li');
      li.innerHTML = `<span>${tier}</span><strong>${med}</strong>`;
      el.statsTierTimes.appendChild(li);
    });
    openModal(el.modalStats);
  }

  function openSettingsModal() {
    const isAnim = state.settings.backgroundAnimation;
    el.optAnimOn.classList.toggle('active', isAnim);
    el.optAnimOn.setAttribute('aria-checked', String(isAnim));
    el.optAnimOff.classList.toggle('active', !isAnim);
    el.optAnimOff.setAttribute('aria-checked', String(!isAnim));
    openModal(el.modalSettings);
  }

  async function handleShareAction() {
    const shareData = {
      title: 'Crossword Daily',
      text: `Solve today's Crossword Daily puzzle!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!');
      } catch (err) {
        // Handled if dismissed by player
      }
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
      } catch (err) {
        showToast('Failed to copy link.');
      }
    } else {
      showToast('Sharing not supported on this browser.');
    }
  }

  function handlePlusAction() {
    showToast('Tileworks Portal: Additional games coming soon.');
  }

  function showToast(msg) {
    el.toastMessage.textContent = msg;
    el.toastMessage.classList.remove('hidden');
    el.toastMessage.style.opacity = '1';
    setTimeout(() => {
      el.toastMessage.style.opacity = '0';
      setTimeout(() => el.toastMessage.classList.add('hidden'), 200);
    }, 2400);
  }

  function openModal(m) { m.classList.remove('hidden'); }
  function closeModal(m) { m.classList.add('hidden'); }

  function updateTimerDisplay() {
    el.gameTimer.textContent = formatTime(state.timerSeconds);
  }

  function formatTime(secs) {
    if (secs == null) return '--:--';
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    const [y, m, d] = isoStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }

  /* ==========================================================================
     EVENT BINDINGS & INPUT ORCHESTRATION
     ========================================================================== */

  function bindEvents() {
    // Header Navigation: Home
    el.btnHeaderHome.addEventListener('click', (e) => {
      e.preventDefault();
      if (HOME_PAGE_URL && HOME_PAGE_URL !== '#') {
        window.location.href = HOME_PAGE_URL;
      } else {
        showScreen('menu');
        renderMenu();
      }
    });

    // Primary Menu Buttons
    el.btnPlayGame.addEventListener('click', () => {
      loadPuzzle(state.todayDate, state.selectedDailyTier);
    });

    el.btnMenuVault.addEventListener('click', () => {
      renderVault();
      showScreen('vault');
    });

    el.btnMenuSettings.addEventListener('click', openSettingsModal);
    el.btnMenuHelp.addEventListener('click', openHowToPlay);
    el.btnGameHelp.addEventListener('click', openHowToPlay);

    // Bottom Centered Utilities
    el.btnUtilStats.addEventListener('click', openStatsModal);
    el.btnUtilShare.addEventListener('click', handleShareAction);
    el.btnUtilPlus.addEventListener('click', handlePlusAction);

    // Screen Subnav Back Buttons
    el.btnGameBack.addEventListener('click', () => {
      clearInterval(state.timerInterval);
      showScreen('menu');
      renderMenu();
    });

    el.btnVaultBack.addEventListener('click', () => {
      showScreen('menu');
      renderMenu();
    });

    // Active Clue bar toggle
    el.activeClueTrigger.addEventListener('click', () => {
      state.direction = state.direction === 'across' ? 'down' : 'across';
      updateSelection();
    });

    // How to Play Panel
    el.btnCloseHelp.addEventListener('click', closeHowToPlay);
    el.panelHelpBackdrop.addEventListener('click', closeHowToPlay);

    // Settings Animation Toggles
    el.optAnimOn.addEventListener('click', () => setBackgroundAnimation(true));
    el.optAnimOff.addEventListener('click', () => setBackgroundAnimation(false));

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach(b => {
      b.addEventListener('click', () => closeModal(document.getElementById(b.dataset.close)));
    });

    el.btnRetryLoad.addEventListener('click', init);

    // Tactile Virtual On-screen Keyboard
    el.onscreenKeyboard.addEventListener('pointerdown', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      e.preventDefault();
      const key = btn.dataset.key;
      if (key === 'DIR') {
        state.direction = state.direction === 'across' ? 'down' : 'across';
        updateSelection();
      } else if (key === 'BACKSPACE') {
        handleBackspace();
      } else if (key) {
        handleInput(key);
      }
    });

    // Hardware Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      if (el.screenGame.classList.contains('hidden')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        state.direction = state.direction === 'across' ? 'down' : 'across';
        updateSelection();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        state.direction = 'across';
        advanceCursor(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        state.direction = 'across';
        advanceCursor(true);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.direction = 'down';
        advanceCursor(false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.direction = 'down';
        advanceCursor(true);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleInput(e.key);
      }
    });
  }

  // Self Initialization on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();