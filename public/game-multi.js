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
  const password = document.getElementById('createPassword').value.trim();
  if (password === '') {
    alert('請輸入密碼');
    return;
  }
  closeDialog('createDialog');
  console.log('✅ 建立房間，密碼：', password);

  // 隱藏主選單區域
  document.getElementById('menu').style.display = 'none';

  // 顯示房間頁面內容 (內嵌 room.html 結構)
  document.getElementById('roomWrapper').style.display = 'block';
}

function confirmJoin() {
  const name = document.getElementById('joinName').value.trim();
  if (name === '') {
    alert('請輸入名字');
    return;
  }
  closeDialog('joinDialog');
  console.log('✅ 加入遊戲，名稱：', name);
  // 你可以在這裡進行 socket emit 或其他動作
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (msg) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.textContent = msg;
    messages.appendChild(div);
    input.value = '';
  }
}

function startGame() {
  alert('開始遊戲！(尚未實作連線邏輯)');
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