const multiBtn = document.getElementById('multiBtn');
const multiOptions = document.getElementById('multiOptions');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const createRoomBtn = document.getElementById('createRoomBtn');

multiBtn.addEventListener('click', () => {
  multiOptions.style.display = multiOptions.style.display === 'none' ? 'block' : 'none';
});

joinRoomBtn.addEventListener('click', () => {
  console.log('🔗 加入房間功能尚待實作');
  // 後續可以開啟輸入房號的 UI
});

createRoomBtn.addEventListener('click', () => {
  console.log('🏠 建立房間功能尚待實作');
  // 後續可以觸發 Socket.IO 建房邏輯
});