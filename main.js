// ===== レベル設定 =====

// 建物ID・表示名・画像パス
const BUILDINGS = [
  { id: "tera",     label: "寺",          img: "img/tera.png" },
  { id: "honmaru",  label: "本丸",        img: "img/honmaru.png" },
  { id: "uma",      label: "馬屋",        img: "img/uma.png" },
  { id: "yumi",     label: "弓場",        img: "img/yumi.png" },
  { id: "ichi",     label: "市（いちば）", img: "img/ichi.png" },
  { id: "machiya1", label: "町屋①",      img: "img/machiya1.png" },
  { id: "jomon",    label: "城門",        img: "img/jomon.png" },
  { id: "hashi",    label: "橋",          img: "img/hashi.png" },
  { id: "machiya2", label: "町屋②",      img: "img/machiya2.png" }
];

// レベルごとの正解配置とヒント
// マス番号は 0〜8 : 北 [0,1,2] / 中 [3,4,5] / 南 [6,7,8]
const LEVELS = {
  1: {
    // レベル1：北＝寺・本丸・馬屋
    solution: [
      "tera",     // 0
      "honmaru",  // 1
      "uma",      // 2
      "yumi",     // 3
      "ichi",     // 4
      "machiya1", // 5
      "jomon",    // 6
      "hashi",    // 7
      "machiya2"  // 8
    ],
    hints: [
      "本丸は、市より北にある。",
      "市は、橋のちょうど北にある。",
      "橋は、城門のすぐとなりにある。",
      "城門は、お城のいちばん南の列（下のだん）にある。",
      "寺は、本丸と同じ横ならびにある。",
      "弓場は、市と同じ横ならびにある。",
      "馬屋は、本丸のとなりにある。",
      "本丸・寺・弓場は、いちばん東には建てられていない。",
      "市は、橋の近くにある。",
      "町屋①は、市のとなりにある。",
      "町屋②は、橋のとなりにある。",
      "寺と城門は、同じ列（たてのならび）にある。",
      "馬屋は、市とは同じ列（たてのならび）にはない。",
      "橋は、お城のいちばん南の列（下のだん）の、まんなかのマスにある。",
      "町屋②は、お城のいちばん南の列（下のだん）にある。",
      "寺は、お城の北西（いちばん上の左）のマスにある。"
    ]
  },
  2: {
    // レベル2：北＝馬屋・本丸・寺
    solution: [
      "uma",      // 0
      "honmaru",  // 1
      "tera",     // 2
      "yumi",     // 3
      "ichi",     // 4
      "machiya1", // 5
      "machiya2", // 6
      "hashi",    // 7
      "jomon"     // 8
    ],
    hints: [
      "市は、お城のまんなかのマスにある。",
      "本丸は、市のちょうど北にある。",
      "馬屋は、本丸の西どなりにある。",
      "寺は、本丸と同じ横ならびで、本丸の東どなりにある。",
      "弓場は、市と同じ横ならびで、市より西にある。",
      "町屋①は、市の東どなりにある。",
      "橋は、市と同じ列（たてのならび）で、市のちょうど南にある。",
      "城門は、橋の東どなりにある。",
      "町屋②は、弓場のちょうど南にある。",
      "城門は、お城のいちばん南の列（下のだん）にある。",
      "馬屋と町屋②は、同じ列（たてのならび）にある。",
      "寺は、お城のいちばん東の列（右の列）にある。",
      "本丸・市・橋は、すべて同じ列（たてのならび）にある。",
      "馬屋と町屋①は、同じ列（たてのならび）にはない。",
      "町屋②は、お城のいちばん南の列（下のだん）にある。",
      "寺と城門は、同じ列（たてのならび）にある。"
    ]
  }
};

// 現在のレベル
let currentLevel = 1;

// DOM取得
const gridEl     = document.getElementById("grid");
const trayEl     = document.getElementById("tray");
const messageEl  = document.getElementById("message");
const checkBtn   = document.getElementById("checkBtn");
const resetBtn   = document.getElementById("resetBtn");
const level1Btn  = document.getElementById("level1Btn");
const level2Btn  = document.getElementById("level2Btn");
const hintsList  = document.getElementById("hintsList");

// スマホ用：今選択している建物ID（タップ操作用）
let selectedBuildingId = null;

// ===== ユーティリティ =====

function getCurrentSolution() {
  return LEVELS[currentLevel].solution;
}

function getCurrentHints() {
  return LEVELS[currentLevel].hints;
}

function findCardElementById(buildingId) {
  return document.querySelector(
    `.building-card[data-building-id="${buildingId}"]`
  );
}

function clearSelection() {
  selectedBuildingId = null;
  document
    .querySelectorAll(".building-card.selected-card")
    .forEach((card) => card.classList.remove("selected-card"));
}

// ===== ヒント描画 =====

function renderHints() {
  hintsList.innerHTML = "";
  const hints = getCurrentHints();
  hints.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    hintsList.appendChild(li);
  });
}

// ===== マップ（9マス）生成 =====

function createGrid() {
  gridEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = String(i);

    const idxLabel = document.createElement("div");
    idxLabel.className = "cell-index";
    idxLabel.textContent = i;
    cell.appendChild(idxLabel);

    // PC向け：ドラッグ中のカードを受け取る
    cell.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    cell.addEventListener("drop", (e) => {
      e.preventDefault();
      const buildingId = e.dataTransfer.getData("text/plain");
      if (!buildingId) return;
      placeCardInCell(buildingId, cell);
      clearSelection();
    });

    // スマホ向け：カード選択後にマスをタップで配置
    cell.addEventListener("click", () => {
      if (!selectedBuildingId) return;
      placeCardInCell(selectedBuildingId, cell);
      clearSelection();
    });

    gridEl.appendChild(cell);
  }
}

// ===== 建物カード生成 =====

function createCards() {
  trayEl.innerHTML = "";
  BUILDINGS.forEach((b) => {
    const card = document.createElement("div");
    card.className = "building-card";
    card.draggable = true;
    card.dataset.buildingId = b.id;

    const img = document.createElement("img");
    img.src = b.img;
    img.alt = b.label;
    img.className = "building-icon";

    const label = document.createElement("div");
    label.textContent = b.label;

    card.appendChild(img);
    card.appendChild(label);

    // PC向け：ドラッグ開始
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", b.id);
      e.dataTransfer.effectAllowed = "move";
      selectCard(b.id, card);
    });

    // スマホ向け：タップで選択 → マスをタップで配置
    card.addEventListener("click", () => {
      selectCard(b.id, card);
    });

    trayEl.appendChild(card);
  });
}

function selectCard(buildingId, cardEl) {
  if (selectedBuildingId === buildingId) {
    clearSelection();
    return;
  }
  clearSelection();
  selectedBuildingId = buildingId;
  cardEl.classList.add("selected-card");
}

// ===== セルにカードを置く処理 =====

function placeCardInCell(buildingId, cellEl) {
  const existing = cellEl.querySelector(".building-card");
  if (existing) {
    trayEl.appendChild(existing);
  }

  const card = findCardElementById(buildingId);
  if (!card) return;

  const parent = card.parentElement;
  if (parent && parent !== trayEl && parent !== cellEl) {
    parent.removeChild(card);
  }

  card.classList.remove("selected-card");
  cellEl.appendChild(card);
}

// ===== リセット・判定 =====

function resetGame() {
  clearSelection();

  messageEl.textContent = "";
  messageEl.className = "text-sm font-semibold ml-1";

  // 全カードをトレイに戻す
  BUILDINGS.forEach((b) => {
    const card = findCardElementById(b.id);
    if (card) {
      trayEl.appendChild(card);
    }
  });

  // セルの強調をリセット
  document.querySelectorAll("#grid > .grid-cell").forEach((cell) => {
    cell.classList.remove("ring-2", "ring-red-400", "ring-emerald-400");
  });
}

function checkAnswer() {
  let correctCount = 0;
  const solution = getCurrentSolution();

  document.querySelectorAll("#grid > .grid-cell").forEach((cell) => {
    cell.classList.remove("ring-2", "ring-red-400", "ring-emerald-400");

    const idx = Number(cell.dataset.index);
    const expectedId = solution[idx];
    const placedCard = cell.querySelector(".building-card");

    if (!placedCard) {
      cell.classList.add("ring-2", "ring-red-400");
      return;
    }

    const actualId = placedCard.dataset.buildingId;
    if (actualId === expectedId) {
      correctCount++;
      cell.classList.add("ring-2", "ring-emerald-400");
    } else {
      cell.classList.add("ring-2", "ring-red-400");
    }
  });

  const emptyCells = Array.from(
    document.querySelectorAll("#grid > .grid-cell")
  ).filter((cell) => !cell.querySelector(".building-card")).length;

  if (correctCount === 9) {
    messageEl.textContent = `🎉 レベル${currentLevel} クリア！ 完ぺきなお城マップです！`;
    messageEl.className = "text-sm font-semibold ml-1 text-emerald-600";
  } else if (emptyCells > 0) {
    messageEl.textContent =
      `まだ置いていないマスが ${emptyCells} 個あります。ヒントを見ながら考えてみよう。`;
    messageEl.className = "text-sm font-semibold ml-1 text-amber-600";
  } else {
    messageEl.textContent =
      `正解は ${correctCount} / 9 マスです。ヒントを見直して、もう一度チャレンジ！`;
    messageEl.className = "text-sm font-semibold ml-1 text-amber-600";
  }
}

// ===== レベル切り替え処理 =====

function updateLevelButtons() {
  if (currentLevel === 1) {
    level1Btn.className =
      "px-3 py-1 rounded-full font-semibold bg-emerald-600 text-white shadow-sm";
    level2Btn.className =
      "px-3 py-1 rounded-full font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300";
  } else {
    level1Btn.className =
      "px-3 py-1 rounded-full font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300";
    level2Btn.className =
      "px-3 py-1 rounded-full font-semibold bg-emerald-600 text-white shadow-sm";
  }
}

function setLevel(level) {
  if (!LEVELS[level]) return;
  currentLevel = level;
  updateLevelButtons();
  resetGame();
  renderHints();
  messageEl.textContent = `レベル${level}に切り替えました。`;
  messageEl.className = "text-sm font-semibold ml-1 text-slate-600";
}

// ===== 初期化 =====

createGrid();
createCards();
renderHints();
updateLevelButtons();

checkBtn.addEventListener("click", checkAnswer);
resetBtn.addEventListener("click", resetGame);
level1Btn.addEventListener("click", () => setLevel(1));
level2Btn.addEventListener("click", () => setLevel(2));
