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

socket.on('syncState', ({ id, name, board, currentPiece, isGameOver }) => {
  otherPlayers[id] = { name, board, currentPiece, isGameOver };
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

function returnToMenu() {
  canvas.style.display = 'none';
  scoreBoard.style.display = 'none';
  menu.style.display = 'block';
  document.getElementById('multiplayerViews').style.display = 'none';
}

socket.on('showGameEndOptions', (winnerName) => {
  if (!isRoomHost) return;

  const confirmed = confirm(`${winnerName} 獲勝！\n\n是否要重新一局？\n\n按「取消」則回到房間。`);
  if (confirmed) {
    location.reload(); // 重新整理頁面開始新一局（簡單方式）
  } else {
    returnToMenu();
  }
});

window.addEventListener('beforeunload', () => {
  socket.emit('syncState', {
    board,
    currentPiece,
    name: playerName1,
    isGameOver: true
  });
  setTimeout(() => {
    socket.disconnect();
    }, 200);
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const confirmed = confirm('確定要離開房間嗎？');
    if (confirmed) {
      socket.emit('syncState', {
        board,
        currentPiece,
        name: playerName1,
        isGameOver: true
      });
      setTimeout(() => {
        socket.disconnect();
        }, 200);
      returnToMenu();
    }
    return;
  }
});