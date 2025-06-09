const socket = io();

let room = null;
const canvas = document.getElementById('gameCanvas');
const menu = document.getElementById('menu');

function startSinglePlayer() {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  console.log('🎮 單人遊戲開始');
  // TODO: 啟動單人邏輯
}

function startMultiplayer() {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  console.log('🌐 多人遊戲開始，等待配對...');
  // 開始配對
}

socket.on('matchFound', data => {
  room = data.room;
  console.log('✅ Match found! Joined room:', room);
});

socket.on('opponentMove', move => {
  console.log('📩 Received opponent move:', move);
  // TODO: Handle opponent move logic
});

// Dummy move sender every 2s
setInterval(() => {
  if (room) {
    socket.emit('playerMove', {
      room,
      data: { x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 20) },
    });
  }
}, 2000);