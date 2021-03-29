const textContainerElement = document.getElementById('text-container');
const timeElement = document.getElementById('time');
const cpmElement = document.getElementById('cpm');

const KEYS = {
    BACKSPACE: 'Backspace',
    SPACE: ' ',
}

const wordsUrl = 'https://saka7.github.io/tst/words.json';
const numOfRows = 2;
const charInRow = 40;
const defaultTime = 60;

const currentState = {
    row: 0,
    word: 0,
    char: 0,
    incorrect: false,
};

const current = {
    get row() {
        return rows[currentState.row];
    },
    get word() {
        return rows[currentState.row][currentState.word];
    },
    get char() {
        return rows[currentState.row][currentState.word][currentState.char];
    },
}

let charsTyped = 0;
let timerStarted = false;
let rows = [];

const splitByRows = (words, charsInRow) => {
    const result = [];
    let row = []

    for (let i = 0, chars = 0; i < words.length; i++) {
        chars += words[i].length;
        if (chars <= charsInRow) {
            row.push(words[i]);
        } else {
            result.push(row);
            row = [];
            chars = 0;
        }
    }

    result.push(row);

    return result;
};

const renderRow = (rows, index) => {
    if (index > rows.length - 1) {
        return;
    }

    const row = document.createElement('div');
    row.setAttribute('id', `row${index}`);

    for (let i = 0; i < rows[index].length; i++) {
        const word = document.createElement('span');
        word.setAttribute('id', `word${i}`);
        word.setAttribute('class', 'word');

        for (let j = 0; j < rows[index][i].length; j++) {
            const char = document.createTextNode(rows[index][i][j]);

            const charContainer = document.createElement('span');
            charContainer.setAttribute('id', `char${j}`);
            charContainer.appendChild(char);

            word.appendChild(charContainer);
        }

        const space = document.createTextNode(' ');

        const spaceContainer = document.createElement('span');
        spaceContainer.appendChild(space);

        row.appendChild(word);
        row.appendChild(spaceContainer);
    }

    textContainerElement.appendChild(row);
};

const renderPrevRow = () => {
    const rowElement = document.getElementById(`row${currentState.row}`);
    rowElement.style.display = 'block';
    textContainerElement.removeChild(textContainerElement.lastChild);
}

const renderRows = (rows, numOfRows) => {
    for (let i = 0; i < numOfRows; i++) {
        renderRow(rows, i);
    }
    formatCurrentWord();
}

const formatCurrentWord = () => {
    const currentRow = document.getElementById(`row${currentState.row}`);
    const currentWord = currentRow.querySelector(`#word${currentState.word}`);
    const currentChar = currentWord.querySelector(`#char${currentState.char}`);

    if (currentChar) {
        currentWord.style.backgroundColor = 'yellow';
        currentChar.style.color = 'white';
        currentChar.style.backgroundColor = 'orange';

        if (currentState.char > 0) {
            const prevChar = currentWord.querySelector(`#char${currentState.char - 1}`);
            prevChar.style.color = 'gray';
            prevChar.style.background = 'none';
        }
    }
}

const formatCorrectWord = () => {
    const currentRow = document.getElementById(`row${currentState.row}`);
    const currentWord = currentRow.querySelector(`#word${currentState.word - 1}`);
    const chars = currentWord.querySelectorAll('span');

    currentWord.style.background = 'none';

    chars.forEach(char => {
        char.style.color = 'green';
        char.style.background = 'none';
    })
}

const formatIncorrectWord = () => {
    const currentRow = document.getElementById(`row${currentState.row}`);
    const currentWord = currentRow.querySelector(`#word${currentState.word}`);
    currentWord.style.backgroundColor = 'red';
}

const formatUntouchedWord = (wholeWord = false) => {
    const row = document.getElementById(`row${currentState.row}`);
    const word = row.querySelector(`#word${currentState.word}`);

    word.style.background = 'none';

    const changeCharStyle = char => {
        if (char) {
            char.style.color = 'black';
            char.style.backgroundColor = 'transparent';
        }
    }

    if (wholeWord) {
        const word = row.querySelector(`#word${currentState.word}`);
        for (let i = 0; i < rows[currentState.row][currentState.word].length; i++) {
            const char = word.querySelector(`#char${i}`);
            changeCharStyle(char);
        }
    } else {
        const char = word.querySelector(`#char${currentState.char}`);
        changeCharStyle(char);
    }
}

const handleBackspace = ctrlKey => {
    if (ctrlKey) {
        charsTyped = Math.max(charsTyped - current.word.length, 0);
        formatUntouchedWord(true);
        if (currentState.word > 0) {
            if (currentState.char === 0) {
                currentState.word--;
            }
        } else if (currentState.row > 0) {
            currentState.row--;
            currentState.word = current.row.length - 1;

            renderPrevRow();
        }
        currentState.char = 0
    } else if (!currentState.incorrect) {
        charsTyped = Math.max(charsTyped - 1, 0);
        formatUntouchedWord();
        if (currentState.char > 0) {
            currentState.char--;
        } else if (currentState.word > 0) {
            currentState.word--;
            currentState.char = current.word.length - 1;
        } else if (currentState.row > 0) {
            currentState.row--;
            currentState.word = current.row.length - 1;
            currentState.char = current.word.length - 1;

            renderPrevRow();
        }
    }
    currentState.incorrect = false;
    formatCurrentWord();
};

const handleSpace = () => {
    if (currentState.incorrect) return;

    if (currentState.char === current.word.length) {
        currentState.word++;
        currentState.char = 0;
        formatCorrectWord();
    }
    if (currentState.word === current.row.length) {
        if (currentState.row < rows.length - 1) {
            currentState.row++;
            currentState.word = 0;
            currentState.char = 0;

            const nextRow = currentState.row + 1;
            const prevRow = Math.max(currentState.row - 1, 0);

            const rowElement = document.getElementById(`row${prevRow}`);
            rowElement.style.display = 'none';
            renderRow(rows, nextRow);
        } else {
            currentState.word--;
            currentState.char = current.word.length - 1;
        }
    }
    formatCurrentWord();
};

const handleInput = key => {
    if (key.length !== 1) return;

    if (currentState.incorrect) {
        return formatIncorrectWord();
    }

    if (key === current.char) {
        currentState.incorrect = false;
        if (currentState.char < current.word.length) {
            currentState.char++;
        } else {
            charsTyped++;
        }
        charsTyped++;
        formatCurrentWord();
    } else {
        currentState.incorrect = true;
        formatIncorrectWord();
    }
};

const startTimer = (time = defaultTime) => {
    timerStarted = true;

    const interval = setInterval(() => {
        timeElement.innerText = String(time);
        if (time > 0) {
            time--;
            const cpm = Math.round(charsTyped * 60 / (defaultTime - time));
            cpmElement.innerText = String(cpm);
        } else {
            clearInterval(interval);
            timerStarted = false;
            charsTyped = 0;
        }
    }, 1000);
};

const observeInput = event => {
    const {key} = event;

    if (!timerStarted) {
        startTimer();
    }

    if (key === KEYS.SPACE) {
        handleSpace();
    } else if (key === KEYS.BACKSPACE) {
        handleBackspace(event.ctrlKey);
    } else {
        handleInput(event.key);
    }
};

const shuffle = array => {
    let currentIndex = array.length;

    while (0 !== currentIndex) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex --;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

const fetchWords = async url => {
    const response = await fetch(url);
    const data = await response.json();
    return shuffle(data);
}


async function main() {
    const words = await fetchWords(wordsUrl);

    rows = splitByRows(words, charInRow);
    renderRows(rows, numOfRows);

    document.querySelector('body').addEventListener('keydown', observeInput);
}

main();

