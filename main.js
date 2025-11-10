// ===== 設定 =====

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

// 正解の配置（インデックス0〜8）
// 北： 寺 / 本丸 / 馬屋
// 中： 弓場 / 市 / 町屋①
// 南： 城門 / 橋 / 町屋②
const SOLUTION = [
  "tera",     // 0
  "honmaru",  // 1
  "uma",      // 2
  "yumi",     // 3
  "ichi",     // 4
  "machiya1", // 5
  "jomon",    // 6
  "hashi",    // 7
  "machiya2"  // 8
];

const gridEl    = document.getElementById("grid");
const trayEl    = document.getElementById("tray");
const messageEl = document.getElementById("message");
const checkBtn  = document.getElementById("checkBtn");
const resetBtn  = document.getElementById("resetBtn");

// スマホ用：今選択している建物ID（タップ操作用）
let selectedBuildingId = null;

// ===== ユーティリティ =====

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

function selectCard(buildingId, cardEl) {
  // 同じカードをもう一度タップ → 選択解除
  if (selectedBuildingId === buildingId) {
    clearSelection();
    return;
  }
  clearSelection();
  selectedBuildingId = buildingId;
  cardEl.classList.add("selected-card");
}

// ===== マップ（9マス）生成 =====

function createGrid() {
  gridEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.index = String(i);

    // 左上に小さいインデックス（先生用・デバッグ用）
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

    // 画像アイコン
    const img = document.createElement("img");
    img.src = b.img;
    img.alt = b.label;
    img.className = "building-icon";

    // テキスト
    const label = document.createElement("div");
    label.textContent = b.label;

    card.appendChild(img);
    card.appendChild(label);

    // PC向け：ドラッグ開始
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", b.id);
      e.dataTransfer.effectAllowed = "move";
      // 見た目も選択状態にしておくとわかりやすい
      selectCard(b.id, card);
    });

    // スマホ向け：タップで選択 → マスをタップで配置
    card.addEventListener("click", () => {
      selectCard(b.id, card);
    });

    trayEl.appendChild(card);
  });
}

// ===== セルにカードを置く処理 =====

function placeCardInCell(buildingId, cellEl) {
  // すでにそのセルにカードがあればトレイに戻す
  const existing = cellEl.querySelector(".building-card");
  if (existing) {
    trayEl.appendChild(existing);
  }

  const card = findCardElementById(buildingId);
  if (!card) return;

  // もし別のセルにあれば、そこから外す
  const parent = card.parentElement;
  if (parent && parent !== trayEl && parent !== cellEl) {
    parent.removeChild(card);
  }

  // セルに追加
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

  document.querySelectorAll("#grid > .grid-cell").forEach((cell) => {
    cell.classList.remove("ring-2", "ring-red-400", "ring-emerald-400");

    const idx = Number(cell.dataset.index);
    const expectedId = SOLUTION[idx];
    const placedCard = cell.querySelector(".building-card");

    if (!placedCard) {
      // 何も置いていないマス
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
    messageEl.textContent = "🎉 全問正解！ 完ぺきなお城マップです！";
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

// ===== 初期化 =====

createGrid();
createCards();

checkBtn.addEventListener("click", checkAnswer);
resetBtn.addEventListener("click", resetGame);
