const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const lastKnownState = {};

const rooms = {};

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', socket => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('createRoom', ({ name, password }) => {
    socket.join(password);
    rooms[password] = rooms[password] || [];
    rooms[password].push({ id: socket.id, name });
    socket.emit('roomJoined', { password, players: rooms[password] });
    socket.to(password).emit('playerJoined', { name });
    io.to(password).emit('updatePlayerList', rooms[password]);
    console.log(`🛠 房間 ${password} 建立，玩家: ${name}`);
  });

  socket.on('joinRoom', ({ name, password }) => {
    if (!rooms[password]) {
      socket.emit('errorMessage', '房間不存在');
      return;
    }

    if (rooms[password].length >= 4) {
      socket.emit('errorMessage', '房間已滿，最多4人');
      return;
    }

    socket.join(password);
    rooms[password].push({ id: socket.id, name });
    socket.emit('roomJoined', { password, players: rooms[password] });
    socket.to(password).emit('playerJoined', { name });
    io.to(password).emit('updatePlayerList', rooms[password]);
    console.log(`✅ 玩家 ${name} 加入房間 ${password}`);
  });

  socket.on('checkRoom', (password) => {
    if (rooms[password]) {
      socket.emit('roomExists');
    } else {
      socket.emit('errorMessage', '房間不存在');
    }
  });

  socket.on('chatMessage', ({ name, text }) => {
    for (const [pwd, players] of Object.entries(rooms)) {
      if (players.find(p => p.id === socket.id)) {
        io.to(pwd).emit('chatMessage', { name, text });
        break;
      }
    }
  });

  socket.on('startGame', (password) => {
    io.to(password).emit('gameStarted');
  });

  socket.on('syncState', (data) => {
    lastKnownState[socket.id] = data;
    for (const [pwd, players] of Object.entries(rooms)) {
        if (players.find(p => p.id === socket.id)) {
          socket.to(pwd).emit('syncState', { ...data, id: socket.id });
          
          break;
        }
      }
  });

  socket.on('sendGarbage', ({ lines, from }) => {
  const amount = lines === 2 ? 1 : lines === 3 ? 2 : 4;

  for (const [pwd, players] of Object.entries(rooms)) {
    if (players.find(p => p.id === socket.id)) {
      const others = players.filter(p => p.id !== socket.id);
      if (others.length === 0) return;

      const target = others[Math.floor(Math.random() * others.length)];

      // 建立固定垃圾行（有空洞）
      const garbageRow = () => {
        const hole = Math.floor(Math.random() * 10);
        return Array.from({ length: 10 }, (_, i) => (i === hole ? 0 : 8));
      };
      const garbage = Array.from({ length: amount }, garbageRow);

      io.to(target.id).emit('receiveGarbage', garbage);
      break;
    }
  }
});

  socket.on('disconnect', () => 
  {
    console.log('❌ Client disconnected:', socket.id);
    for (const [pwd, players] of Object.entries(rooms)) {
      const idx = players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const leftPlayer = players.splice(idx, 1)[0];

          // 🔧 新增：傳送灰磚畫面狀態
        socket.to(pwd).emit('syncState', {
          id: socket.id,
          name: leftPlayer.name,
          board: lastKnownState[socket.id]?.board || [],
          currentPiece: lastKnownState[socket.id]?.currentPiece || { shape: [], x: 0, y: 0 },
          isGameOver: true
        });

        socket.to(pwd).emit('playerLeft', { name: leftPlayer.name });
        io.to(pwd).emit('updatePlayerList', players);
        if (players.length === 0) {
          delete rooms[pwd];
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
