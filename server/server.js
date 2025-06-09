const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

let waitingPlayer = null;

io.on('connection', socket => {
  console.log('🔌 New client connected:', socket.id);

  if (waitingPlayer) {
    const room = `room-${waitingPlayer.id}-${socket.id}`;
    socket.join(room);
    waitingPlayer.join(room);

    socket.emit('matchFound', { room });
    waitingPlayer.emit('matchFound', { room });

    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
  }

  socket.on('playerMove', ({ room, data }) => {
    socket.to(room).emit('opponentMove', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    if (waitingPlayer === socket) waitingPlayer = null;
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
