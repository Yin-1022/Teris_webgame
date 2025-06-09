const socket = io();

let room = null;

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
