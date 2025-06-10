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
  startMultiplayer();
  // 這裡可以加上 create room 的邏輯
}
 