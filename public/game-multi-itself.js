function startMultiplayerGame() {
  board = createBoard();
  score = 0;
  scoreEl.textContent = score;
  holdPiece = null;
  nextPiece = createPiece(randomType());
  resetPiece();
  update(); // 呼叫 animation loop
  socket.emit('syncState', {
    board,
    currentPiece,
    name: playerName1,
    isGameOver: false
  });
  console.log('🎮 多人遊戲開始！');
}

const otherPlayers = {};

socket.on('syncState', ({ id, name, board, currentPiece }) => {
  otherPlayers[id] = { name, board, currentPiece };
  renderOtherPlayers();
});

function renderOtherPlayers() {
  const container = document.getElementById('multiplayerViews');
  container.innerHTML = '';

  for (const [id, player] of Object.entries(otherPlayers)) {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 600;
    canvas.classList.add('multiplayer-canvas');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (player.isGameOver) {
      drawMatrixGray(player.board, 0, 0, ctx);
      drawMatrixGray(player.currentPiece.shape, player.currentPiece.x, player.currentPiece.y, ctx);
    } else {
      drawMatrix(player.board, 0, 0, ctx, false);
      drawMatrix(player.currentPiece.shape, player.currentPiece.x, player.currentPiece.y, ctx, false);
    }

    const label = document.createElement('div');
    label.style.textAlign = 'center';
    label.style.color = '#fff';
    label.style.fontSize = '14px';
    label.textContent = player.name;

    const wrapper = document.createElement('div');
    wrapper.classList.add('multiplayer-view');
    wrapper.appendChild(canvas);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  }
}

window.addEventListener('beforeunload', () => {
  socket.emit('syncState', {
    board,
    currentPiece,
    name: playerName1,
    isGameOver: true
  });
  socket.disconnect();
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    socket.emit('syncState', {
      board,
      currentPiece,
      name: playerName1,
      isGameOver: true
    });
    socket.disconnect();
    returnToMenu();
    return;
  }
});