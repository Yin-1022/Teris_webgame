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

function checkIfOnlyOneAlive() {
  const aliveCount = Object.values(otherPlayers).filter(p => !p.isGameOver).length + (isGameOver ? 0 : 1);
  return aliveCount === 1;
}

function showRestartOptions() {
  if (document.getElementById('restartOptions')) return; // 已顯示過就不再新增

  const container = document.createElement('div');
  container.id = 'restartOptions';
  container.style.marginTop = '20px';

  const restartBtn = document.createElement('button');
  restartBtn.textContent = '再玩一次';
  restartBtn.onclick = () => {
    container.remove();
    socket.emit('startGame', roomPassword); // 重新發送 startGame
  };

  const backBtn = document.createElement('button');
  backBtn.textContent = '返回房間';
  backBtn.onclick = () => {
    container.remove();
    returnToMenu();
  };

  container.appendChild(restartBtn);
  container.appendChild(backBtn);

  document.body.appendChild(container);
}

function returnToMenu() {
  canvas.style.display = 'none';
  scoreBoard.style.display = 'none';
  menu.style.display = 'block';
  document.getElementById('multiplayerViews').style.display = 'none';
}

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