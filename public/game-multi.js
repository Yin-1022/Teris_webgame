const menu = document.getElementById('menu');

function showMultiplayerOptions() {
    document.getElementById('multiplayerOptions').style.display = 'block';
}

function joinGame() {
  console.log('🔗 加入遊戲');
  startMultiplayer();
  // 這裡可以加上 join room 的邏輯
}

function createGame() {
  console.log('🛠️ 建立遊戲'); 
  document.getElementById('createRoomModal').style.display = 'flex';
  // 這裡可以加上 create room 的邏輯

  document.getElementById('createRoomSubmit').addEventListener('click', () => {
    const nameInput = document.getElementById('playerNameInput');
    const playerName = nameInput.value.trim();
    if (!playerName) {
      alert('請輸入名字！');
      return;
    }

    // 隱藏對話框
    document.getElementById('createRoomModal').style.display = 'none';

    // 這裡可以用 socket.io 或其他邏輯建立房間並加入
    // 假設直接跳轉到房間畫面（或切換顯示）
    enterRoom(playerName);
  });

  document.getElementById('createRoomCancel').addEventListener('click', () => {
    document.getElementById('createRoomModal').style.display = 'none';
  });
}

function enterRoom(playerName) 
{
  menu.style.display = 'none';
}
 