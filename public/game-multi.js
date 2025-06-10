const multiplayerBtn = document.getElementById('multiplayerBtn');
const multiOptions = document.getElementById('multiOptions');

multiplayerBtn.addEventListener('click', () => {
  if (multiOptions.style.display === 'none') {
    multiOptions.style.display = 'block';
  } else {
    multiOptions.style.display = 'none';
  }
});