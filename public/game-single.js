let isGameOver = false;
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

let combo = 0;              // 連續消行計數
let comboMessage = '';      // 顯示的文字訊息
let comboMessageTimer = 0;  // 訊息顯示時間計數（ms）
const comboMessageDuration = 1500; // 顯示時間：1.5秒

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

let keyState = {
  left: false,
  right: false,
  down: false
};

let moveDelay = 100; // 移動間隔（毫秒）
let moveTimer = {
  left: 0,
  right: 0,
  down: 0
};

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
        context.fillStyle = value === 9 ? '#333' : 'cyan';
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
  if (isGameOver) {
    // 畫已放置方塊(灰色)
    drawMatrixGray(board, 0, 0);

    // 畫目前方塊(灰色)
    drawMatrixGray(currentPiece.shape, currentPiece.x, currentPiece.y);

    // 畫ghost piece 也用灰色
    const ghost = { ...currentPiece, y: currentPiece.y };
    while (!collideAt(ghost)) {
      ghost.y++;
    }
    ghost.y--;
    drawMatrixGray(ghost.shape, ghost.x, ghost.y, ctx);

  } else {
    drawMatrix(board, 0, 0);
    drawGhostPiece();
    drawMatrix(currentPiece.shape, currentPiece.x, currentPiece.y);
  }

}

function drawPreview() {
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  const offsetX = Math.floor((5 - nextPiece.shape[0].length) / 2);
  const offsetY = Math.floor((5 - nextPiece.shape.length) / 2);
  if (isGameOver) {
    drawMatrixGray(nextPiece.shape, 1, 1, previewCtx);
  } else {
    drawMatrix(nextPiece.shape, 1, 1, previewCtx);
  }
}

function drawHold() {
  holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
   if (holdPiece) {
    const offsetX = Math.floor((5 - holdPiece.shape[0].length) / 2);
    const offsetY = Math.floor((5 - holdPiece.shape.length) / 2);
    if (isGameOver) {
      drawMatrixGray(holdPiece.shape, 1, 1, holdCtx);
    } else {
      drawMatrix(holdPiece.shape, 1, 1, holdCtx);
    }
  }
}

function drawMatrixGray(matrix, offsetX, offsetY, context = ctx) {
  context.fillStyle = '#777'; // 灰色
  context.strokeStyle = '#444'; // 深灰邊框
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillRect((x + offsetX) * BLOCK_SIZE, (y + offsetY) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        context.strokeRect((x + offsetX) * BLOCK_SIZE, (y + offsetY) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
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

  const scoreTable = {
    1: 100,
    2: 300,
    3: 500,
    4: 800
  };

  if (linesCleared > 0) {
    score += scoreTable[linesCleared] || (linesCleared * 200);
    scoreEl.textContent = score;

    if (typeof socket !== 'undefined' && playerName1 && !isGameOver) {
    const linesToSend = { 2: 1, 3: 2, 4: 4 }[linesCleared] || 0;
    if (linesToSend > 0) {
      socket.emit('sendGarbage', { lines: linesToSend });
    }
  }

    // 判斷是否為連續消行
    combo++;
    // 4行一次稱為TETRIS
    if (linesCleared === 4) {
      comboMessage = '🔥 TETRIS! 🔥';
    } else if (combo > 1) {
      comboMessage = `COMBO x${combo}!`;
      score += combo * 50; // 每次combo額外加分
      scoreEl.textContent = score;
    } else {
      comboMessage = '';
    }
    comboMessageTimer = comboMessageDuration;
  } else {
    // 沒消行，combo 歸零
    combo = 0;
  }
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

function rotateCounterClockwise(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
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
    mergePiece();
    draw();

    if (currentPiece.y < 1 || pieceHitsTop(currentPiece)) {
      isGameOver = true;
      draw();
      drawPreview();
      drawHold();
      drawGameOver();
      return; // 不再產生新方塊
    }

    currentPiece = nextPiece || createPiece(randomType());
    nextPiece = createPiece(randomType());
    drawPreview();
    drawHold();
  }
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💀 GAME OVER 💀', canvas.width / 1.9, canvas.height / 2 + 12);
}

function randomType() {
  const types = Object.keys(PIECES);
  return types[Math.floor(Math.random() * types.length)];
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  if (!isGameOver)
  {
    dropInterval = 400;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      drop();
    }
    if (keyState.left && time - moveTimer.left > moveDelay) {
      move(-1);
      moveTimer.left = time;
    }
    if (keyState.right && time - moveTimer.right > moveDelay) {
      move(1);
      moveTimer.right = time;
    }
    if (keyState.down && time - moveTimer.down > moveDelay) {
      drop();
      moveTimer.down = time;
    }
  }
  
  draw();

  if (typeof socket !== 'undefined' && playerName1) {
    socket.emit('syncState', {
      board,
      currentPiece,
      name: playerName1,
      isGameOver
    });
  }

  if (!isGameOver) {
    requestAnimationFrame(update);
  }
}

function startSinglePlayer() {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  scoreBoard.style.display = 'block';
  board = createBoard();
  score = 0;
  scoreEl.textContent = score;
  holdPiece = null;
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

function returnToMenu() {
  isGameOver = false;
  currentPiece = null;
  board = [];
  holdPiece = null;
  holdUsed = false;
  score = 0;
  room = null;

  canvas.style.display = 'none';
  scoreBoard.style.display = 'none';
  menu.style.display = 'block';

  console.log('↩️ 返回主選單');
}

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    returnToMenu();
    return;
  }

  if (!currentPiece) return;

  if (isGameOver) {
    if (e.key) {
      isGameOver = false;
      startSinglePlayer();
    }
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
      keyState.left = true;
      break;
    case 'ArrowRight':
      keyState.right = true;
      break;
    case 'ArrowDown':
      keyState.down = true;
      break;
    case 'ArrowUp': {
      const rotated = rotate(currentPiece.shape);
      const originalShape = currentPiece.shape;
      const originalX = currentPiece.x;
      const originalY = currentPiece.y;

      const offsets = [
        [0, 0],
        [-1, 0], [1, 0],
        [-2, 0], [2, 0],
        [0, 1], [0, 2]
      ];

      let rotatedSuccessfully = false;

      for (const [dx, dy] of offsets) {
        currentPiece.shape = rotated;
        currentPiece.x = originalX + dx;
        currentPiece.y = originalY + dy;

        if (!collide()) {
          rotatedSuccessfully = true;
          break;
        }
      }

      if (!rotatedSuccessfully) {
        currentPiece.shape = originalShape;
        currentPiece.x = originalX;
        currentPiece.y = originalY;
      }

      break;
    }
    case 'z': {
      const rotated = rotateCounterClockwise(currentPiece.shape);
      const originalShape = currentPiece.shape;
      const originalX = currentPiece.x;
      const originalY = currentPiece.y;

      const offsets = [
        [0, 0],
        [-1, 0], [1, 0],
        [-2, 0], [2, 0],
        [0, 1], [0, 2]
      ];

      let rotatedSuccessfully = false;

      for (const [dx, dy] of offsets) {
        currentPiece.shape = rotated;
        currentPiece.x = originalX + dx;
        currentPiece.y = originalY + dy;

        if (!collide()) {
          rotatedSuccessfully = true;
          break;
        }
      }

      if (!rotatedSuccessfully) {
        currentPiece.shape = originalShape;
        currentPiece.x = originalX;
        currentPiece.y = originalY;
      }

      break;
    }
    case ' ':
      e.preventDefault();
      hardDrop();
      break;
    case 'c':
    case 'C':
      holdCurrentPiece();
      break;
  }
});

window.addEventListener('keyup', e => {
  switch (e.key) {
    case 'ArrowLeft':
      keyState.left = false;
      break;
    case 'ArrowRight':
      keyState.right = false;
      break;
    case 'ArrowDown':
      keyState.down = false;
      break;
  }
});
