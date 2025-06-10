function toggleMultiplayerOptions() 
{
  const options = document.getElementById('multiplayerOptions');
  if (options.style.display === 'none' || options.style.display === '') {
    options.style.display = 'flex';
  } else {
    options.style.display = 'none';
  }
}