const multiplayerBtn = document.getElementById('multiplayerBtn');
const multiplayerOptions = document.getElementById('multiplayerOptions');

multiplayerBtn.addEventListener('click', () => {
  // 清空先前選項
  multiplayerOptions.innerHTML = '';

  // 建立「加入房間」按鈕
  const joinRoomBtn = document.createElement('button');
  joinRoomBtn.textContent = '加入房間';
  joinRoomBtn.onclick = () => {
    alert('加入房間功能尚未實作');
  };

  // 建立「建立新房間」按鈕
  const createRoomBtn = document.createElement('button');
  createRoomBtn.textContent = '建立新房間';
  createRoomBtn.style.marginLeft = '10px';
  createRoomBtn.onclick = () => {
    const roomCode = generateRoomCode(6);
    alert(`成功建立房間，房間代碼：${roomCode}`);
    // 假設用URL跳轉到房間頁面，例如：
    window.location.href = `/room/${roomCode}`;
  };

  multiplayerOptions.appendChild(joinRoomBtn);
  multiplayerOptions.appendChild(createRoomBtn);
});

// 產生隨機6位英數字房間代碼
function generateRoomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for(let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}