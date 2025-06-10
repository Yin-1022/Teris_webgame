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

function confirmCreate() 
{
  const name = document.getElementById('joinName').value.trim();
  if (name === '') {
    alert('請輸入名字');
    return;
  }
  closeDialog('createDialog');
  console.log('✅ 建立房間，名稱：', name);
  window.location.href = 'room.html';
}

function confirmJoin() {
  const password = document.getElementById('createPassword').value.trim();
  if (password === '') {
    alert('請輸入密碼');
    return;
  }
  closeDialog('joinDialog');
  console.log('✅ 加入遊戲，密碼：', password);
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