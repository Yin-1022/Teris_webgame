let playerName1 = '';
let playerName2 = '';
let playerName3 = '';
let playerName4 = '';
let roomPassword = '';

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
  const name = document.getElementById('createName').value.trim();
  if (name === '') {
    alert('請輸入名字');
    return;
  }
  closeDialog('createDialog');
  playerName1 = name; // 將輸入視為名字

  roomPassword = generateRoomPassword();

  // 隱藏主選單區域
  document.getElementById('menu').style.display = 'none';

  // 顯示房間頁面內容 (內嵌 room.html 結構)
  document.getElementById('roomWrapper').style.display = 'block';

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
  // 你可以在這裡進行 socket emit 或其他動作
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (msg) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.textContent = `${playerName1}: ${msg}`;
    messages.appendChild(div);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
  }
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
  alert('開始遊戲！(尚未實作連線邏輯)');
}

function returnToMenu() {

  document.getElementById('roomWrapper').style.display = 'none';
  menu.style.display = 'block';

  const messages = document.getElementById('chatMessages');
  if (messages) messages.innerHTML = '';

  console.log('↩️ 返回主選單');
}

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
    returnToMenu();
    return;
  }
});  