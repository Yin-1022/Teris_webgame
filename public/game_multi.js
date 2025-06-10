const multiBtn = document.getElementById('multiBtn');
const multiOptions = document.getElementById('multiOptions');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');

multiBtn.addEventListener('click', () => {
  multiOptions.style.display = 'block';
});

createRoomBtn.addEventListener('click', () => {
  const roomCode = generateRoomCode();
  roomCodeDisplay.textContent = `房間代碼：${roomCode}`;
  // 在這裡與伺服器連線後 emit: socket.emit('createRoom', roomCode);
});

function generateRoomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}