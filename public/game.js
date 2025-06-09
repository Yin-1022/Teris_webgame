const socket = io();

let room = null;
let holdPiece = null;
let holdUsed = false; // 每回合只能使用一次
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const scoreBoard = document.getElementById('scoreBoard');
const menu = document.getElementById('menu');
const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
let board = [];
let currentPiece;
let nextPiece;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;

const PIECES = {
  I: [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 0, 0], [0, 1, 0], [1, 1, 1]],
  S: [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
  Z: [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
  J: [[0, 0, 0], [1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 0], [0, 0, 1], [1, 1, 1]]
};

const COLORS = {
  I: 'cyan',
  O: 'yellow',
  T: 'purple',
  S: 'green',
  Z: 'red',
  J: 'blue',
  L: 'orange'
};

function createPiece(type) {
  const shape = PIECES[type];
  
  // 找出 shape 中第一個含有非 0 值的 row（offset）
  let offsetY = 0;
  for (let y = 0; y < shape.length; y++) {
    if (shape[y].some(cell => cell !== 0)) {
      offsetY = y;
      break;
    }
  }

  return {
    shape,
    x: Math.floor((COLS - shape[0].length) / 2), // 居中
    y: -offsetY // 使最上方有內容的那一列貼齊畫面頂端
  };
}

function createBoard() {
  const matrix = [];
  for (let r = 0; r < ROWS; r++) {
    matrix.push(new Array(COLS).fill(0));
  }
  return matrix;
}

function drawMatrix(matrix, offsetX, offsetY, context = ctx, ghost = false) {
  context.globalAlpha = ghost ? 0.3 : 1;
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'cyan';
        context.fillRect((x + offsetX) * BLOCK_SIZE, (y + offsetY) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        context.strokeStyle = '#222';
        context.strokeRect((x + offsetX) * BLOCK_SIZE, (y + offsetY) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
  context.globalAlpha = 1;
}

function drawGhostPiece() {
  const ghost = { ...currentPiece, y: currentPiece.y };
  while (!collideAt(ghost)) {
    ghost.y++;
  }
  ghost.y--;
  drawMatrix(ghost.shape, ghost.x, ghost.y, ctx, true);
}

function collideAt(piece) {
  const { shape, x: px, y: py } = piece;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (
        shape[y][x] &&
        (board[py + y] === undefined || board[py + y][px + x] === undefined || board[py + y][px + x])
      ) {
        return true;
      }
    }
  }
  return false;
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, 0, 0);
  drawGhostPiece();
  drawMatrix(currentPiece.shape, currentPiece.x, currentPiece.y);
}

function drawPreview() {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  drawMatrix(nextPiece.shape, 1, 1, previewCtx);
}

function drawHold() {
  holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
  if (holdPiece) {
    drawMatrix(holdPiece.shape, 1, 1, holdCtx);
  }
}

function holdCurrentPiece() {
  if (holdUsed) return;

  if (!holdPiece) {
    holdPiece = { ...currentPiece }; // clone current
    currentPiece = nextPiece;
    nextPiece = createPiece(randomType());
  } else {
    [currentPiece, holdPiece] = [holdPiece, currentPiece];
    currentPiece.x = 3;
    currentPiece.y = 0;
  }

  drawPreview();
  drawHold();
  holdUsed = true;
}

function mergePiece() {
  currentPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[currentPiece.y + y][currentPiece.x + x] = value;
      }
    });
  });
}

function collide() {
  return collideAt(currentPiece);
}

function drop() {
  currentPiece.y++;
  if (collide()) {
    currentPiece.y--;
    mergePiece();
    clearLines();
    resetPiece();
  }
  dropCounter = 0;
}

function hardDrop() {
  let dropDistance = 0;
  while (!collide()) {
    currentPiece.y++;
    dropDistance++;
  }
  currentPiece.y--; // 回到最後有效位置
  dropDistance--;
  mergePiece();
  clearLines();
  resetPiece();
  dropCounter = 0;

  // 加分（可選：每格 +10 分）
  score += dropDistance * 10;
  scoreEl.textContent = score;
}

function clearLines() {
  let linesCleared = 0;
  board = board.filter(row => {
    if (row.every(cell => cell !== 0)) {
      linesCleared++;
      return false;
    }
    return true;
  });
  while (board.length < ROWS) {
    board.unshift(new Array(COLS).fill(0));
  }
  score += linesCleared * 100;
  scoreEl.textContent = score;
}

function rotate(matrix) {
  const N = matrix.length;
  const result = [];
  for (let y = 0; y < N; ++y) {
    result.push([]);
    for (let x = 0; x < N; ++x) {
      result[y][x] = matrix[N - x - 1][y];
    }
  }
  return result;
}

function move(dir) {
  currentPiece.x += dir;
  if (collide()) {
    currentPiece.x -= dir;
  }
}

function resetPiece() {
  currentPiece = nextPiece || createPiece(randomType());
  nextPiece = createPiece(randomType());
  holdUsed = false;
  drawPreview();
  drawHold();
  if (collide()) {
    board = createBoard();
    score = 0;
    scoreEl.textContent = score;
    alert('💀 Game Over');
  }
}

function randomType() {
  const types = Object.keys(PIECES);
  return types[Math.floor(Math.random() * types.length)];
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    drop();
  }
  draw();
  requestAnimationFrame(update);
}

function startSinglePlayer() {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  scoreBoard.style.display = 'block';
  board = createBoard();
  score = 0;
  scoreEl.textContent = score;
  nextPiece = createPiece(randomType());
  resetPiece();
  update();
  console.log('🎮 單人遊戲開始');
}

function startMultiplayer() {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  scoreBoard.style.display = 'none';
  console.log('🌐 多人遊戲開始，等待配對...');
}

socket.on('matchFound', data => {
  room = data.room;
  console.log('✅ Match found! Joined room:', room);
});

socket.on('opponentMove', move => {
  console.log('📩 Received opponent move:', move);
});

window.addEventListener('keydown', e => {
  if (!currentPiece) return;
  switch (e.key) {
    case 'c':
      holdCurrentPiece();
      break;
    case 'C':
      holdCurrentPiece();
      break;
    case ' ': // 空白鍵
      e.preventDefault(); // 避免滾動網頁
      hardDrop();
      break;
    case 'ArrowLeft':
      move(-1);
      break;
    case 'ArrowRight':
      move(1);
      break;
    case 'ArrowDown':
      drop();
      break;
    case 'ArrowUp': {
      const rotated = rotate(currentPiece.shape);
      const original = currentPiece.shape;
      currentPiece.shape = rotated;
      if (collide()) {
        currentPiece.shape = original; // revert if invalid
      }
      break;
    }
  }
});
