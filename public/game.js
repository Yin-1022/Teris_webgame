const socket = io();

let room = null;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
let board = [];
let currentPiece;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

const PIECES = 
{
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

function createPiece(type) 
{
  return {
    shape: PIECES[type],
    x: 3,
    y: 0
  };
}

function createBoard() 
{
  const matrix = [];
  for (let r = 0; r < ROWS; r++) {
    matrix.push(new Array(COLS).fill(0));
  }
  return matrix;
}

function drawMatrix(matrix, offsetX, offsetY) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = 'cyan';
        ctx.fillRect((x + offsetX) * BLOCK_SIZE, (y + offsetY) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#222';
        ctx.strokeRect((x + offsetX) * BLOCK_SIZE, (y + offsetY) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, 0, 0);
  drawMatrix(currentPiece.shape, currentPiece.x, currentPiece.y);
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
  const { shape, x: px, y: py } = currentPiece;
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

function drop() 
{
  currentPiece.y++;
  if (collide()) {
    currentPiece.y--;
    mergePiece();
    resetPiece();
    clearLines();
  }
  dropCounter = 0;
}

function clearLines() 
{
  board = board.filter(row => row.some(cell => cell === 0));
  while (board.length < ROWS) {
    board.unshift(new Array(COLS).fill(0));
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

function move(dir) {
  currentPiece.x += dir;
  if (collide()) {
    currentPiece.x -= dir;
  }
}

function resetPiece() 
{
  const types = Object.keys(PIECES);
  const rand = types[Math.floor(Math.random() * types.length)];
  currentPiece = createPiece(rand);
  if (collide()) {
    board = createBoard();
    alert('💀 Game Over');
  }
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

function startSinglePlayer() 
{
  menu.style.display = 'none';
  canvas.style.display = 'block';
  board = createBoard();
  resetPiece();
  update();
  console.log('🎮 單人遊戲開始');
}

function startMultiplayer() 
{
  menu.style.display = 'none';
  canvas.style.display = 'block';
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