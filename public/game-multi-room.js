const socket = io();

let playerName1 = '';
let playerName2 = '';
let playerName3 = '';
let playerName4 = '';
let roomPassword = '';

let isRoomHost = false;

function generateRoomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function toggleMultiplayerOptions() 
{
  const options = document.getElementById('multiplayerOptions');
  if (options.style.display === 'none' || options.style.display === '') {
    options.style.display = 'flex';
  } else {
    options.style.display = 'none';
  }
}

function joinGame() {
  showDialog('joinDialog');
}

function createGame() {
  showDialog('createDialog');
}

function showDialog(id) {
  document.getElementById(id).style.display = 'block';
}

function closeDialog(id) {
  document.getElementById(id).style.display = 'none';
}

function confirmCreate() {
  isRoomHost = true;
  
  const name = document.getElementById('createName').value.trim();
  if (name === '') {
    alert('請輸入名字');
    return;
  }
  closeDialog('createDialog');
  playerName1 = name; // 將輸入視為名字
  roomPassword = generateRoomPassword();

  socket.emit('createRoom', { name: playerName1, password: roomPassword });

  // 隱藏主選單區域
  document.getElementById('menu').style.display = 'none';

  // 顯示房間頁面內容 (內嵌 room.html 結構)
  document.getElementById('roomWrapper').style.display = 'block';

  document.getElementById('startButton').style.display = isRoomHost ? 'block' : 'none';

  const playerList = document.getElementById('players');
  if (playerList && playerList.children.length > 0) {
    playerList.children[0].textContent = playerName1;
  }

  const passwordLabel = document.getElementById('roomPassword');
  if (passwordLabel) {
    passwordLabel.textContent = roomPassword;
  }

  appendSystemMessage(`${playerName1} 已進入房間`);
}

function confirmJoin() {
  const password = document.getElementById('joinPassword').value.trim();
  if (password === '') {
    alert('請輸入密碼');
    return;
  }
  closeDialog('joinDialog');
  
  const name = prompt('請輸入你的名字');
  if (!name) return;
  playerName1 = name;
  socket.emit('joinRoom', { name, password });

  socket.on('roomJoined', ({ password, players }) => {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('roomWrapper').style.display = 'block';
    document.getElementById('startButton').style.display = isRoomHost ? 'block' : 'none';

    const passwordLabel = document.getElementById('roomPassword');
    if (passwordLabel) passwordLabel.textContent = password;

    const playerList = document.getElementById('players');
    for (let i = 0; i < players.length; i++) {
      if (playerList.children[i]) {
        playerList.children[i].textContent = players[i].name;
      }
    }

    appendSystemMessage(`${playerName1} 已進入房間`);
  });

  socket.on('errorMessage', msg => {
    alert(msg);
  });
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (msg) {
    socket.emit('chatMessage', { name: playerName1, text: msg });
    input.value = '';
  }
}

function startGame() {
  if (!isRoomHost) return;
  socket.emit('startGame', roomPassword);
}

function appendSystemMessage(text) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.textContent = text;
  div.style.fontStyle = 'italic';
  div.style.opacity = '0.8';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function startGame() {
  socket.emit('startGame', roomPassword);
}

function returnToMenu() {

  document.getElementById('roomWrapper').style.display = 'none';
  menu.style.display = 'block';

  // 清空聊天室內容
  const messages = document.getElementById('chatMessages');
  if (messages) messages.innerHTML = '';

  // 重設玩家名單
  const playerList = document.getElementById('players');
  if (playerList) {
    const defaultNames = ['---', '---', '---', '---'];
    for (let i = 0; i < playerList.children.length; i++) {
      playerList.children[i].textContent = defaultNames[i] || '';
    }
  }

  // 清除房間密碼
  const passwordLabel = document.getElementById('roomPassword');
  if (passwordLabel) {
    passwordLabel.textContent = '------';
  }

  console.log('↩️ 返回主選單');
}

socket.on('playerLeft', ({ name }) => {
  appendSystemMessage(`${name} 已離開房間`);
});

socket.on('playerJoined', ({ name }) => {
    appendSystemMessage(`${name} 已進入房間`);
  });

socket.on('chatMessage', ({ name, text }) => {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.textContent = `${name}: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('updatePlayerList', (players) => {
  const playerList = document.getElementById('players');
  for (let i = 0; i < playerList.children.length; i++) {
    playerList.children[i].textContent = players[i]?.name || `---`;
  }
});

socket.on('gameStarted', () => {
  isGameOver = false;

  document.getElementById('roomWrapper').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  document.getElementById('scoreBoard').style.display = 'block';
  document.getElementById('multiplayerViews').style.display = 'flex';

  // 可依需求顯示 multiplayer scoreboard
  startMultiplayerGame(); // 你會在 game-multi-itself.js 中實作這個
});

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chatInput');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChat();
    }
  });
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    socket.disconnect();
    returnToMenu();
    return;
  }
});  

window.addEventListener('beforeunload', () => {
  socket.disconnect(); // 通知後端處理離開
});