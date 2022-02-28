const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

const keyboard = document.querySelector('[data-keyboard]');
const guessGrid = document.querySelector('[data-guess-grid]');
const alertContainer = document.querySelector('[data-alert-container]');

// const targetWord = targetWords[Math.floor(Math.random() * targetWords.length)];
const targetWord = words[Math.floor(Math.random() * words.length)];

startInteraction();

function startInteraction() {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener('click', handleMouseClick);
  document.removeEventListener('keydown', handleKeyPress);
}

function handleMouseClick(e) {
  if (e.target.matches('[data-key]')) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches('[data-enter]')) {
    submitGuess();
    return;
  }

  if (e.target.matches('[data-delete]')) {
    deleteKey();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    submitGuess();
    return;
  }

  if (e.key === 'Backspace' || e.key === 'Delete') {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }

  showAlert('Invalid letter/key');
}

function pressKey(key) {
  const activeTile = getActiveTiles();
  if (activeTile.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(':not([data-letter])');
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = 'active';
}

function deleteKey() {
  const activeTile = getActiveTiles();
  const lastTile = activeTile[activeTile.length - 1];
  if (!lastTile) return;
  lastTile.textContent = '';
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert('Not enough letters');
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => word + tile.dataset.letter, '');

  if (!words.includes(guess)) {
    showAlert('Not in word list');
    shakeTiles(activeTiles);
    return;
  }

  stopInteraction();

  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add('flip');
  }, (index * FLIP_ANIMATION_DURATION) / 2);


  // TODO: fix multiple letters (cases: virus - class, label - allow)
  tile.addEventListener(
    'transitionend',
    () => {
      tile.classList.remove('flip');

      if (targetWord[index] === letter) {
        tile.dataset.state = 'correct';
        key.classList.add('correct');
      } /* Show the correct number of time - No extra and not less */ else if (
        targetWord.includes(letter) &&
        (countLetterInWord(guess, letter) <= countLetterInWord(targetWord, letter) || (index === guess.indexOf(letter) && index === guess.lastIndexOf(letter)))
      ) {
        tile.dataset.state = 'wrong-location';
        key.classList.add('wrong-location');
      } else {
        tile.dataset.state = 'wrong';
        key.classList.add('wrong');
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          'transitionend',
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function countLetterInWord(word, letter) {
  return (word.match(new RegExp(letter, 'g')) || []).length;
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement('div');
  alert.textContent = message;
  alert.classList.add('alert');
  alertContainer.prepend(alert);

  if (!duration) return;

  setTimeout(() => {
    alert.classList.add('hide');
    alert.addEventListener('transitionend', () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add('shake');
    tile.addEventListener(
      'animationend',
      () => {
        tile.classList.remove('shake');
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  const remainingTiles = guessGrid.querySelectorAll(':not([data-letter])');

  if (guess === targetWord) {
    showWinningAlertByGuessNumber(remainingTiles.length);
    danceTile(tiles);
    stopInteraction();
    return;
  }

  if (remainingTiles.length <= 0) {
    showAlert(targetWord.toUpperCase(), null);
    stopInteraction();
    return;
  }
}

function danceTile(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add('dance');
      tile.addEventListener(
        'animationend',
        () => {
          tile.classList.remove('dance');
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}

function showWinningAlertByGuessNumber(remainingTiles) {
  const guessNumber = 6 - remainingTiles / 5;
  const WINNING_ALERT_DURATION = 5000;

  const winnigMesagges = ['No Way !', 'Impressive', 'Genius', 'Splendid', 'Nice', 'That was close !'];

  showAlert(winnigMesagges[guessNumber - 1], WINNING_ALERT_DURATION);
}
