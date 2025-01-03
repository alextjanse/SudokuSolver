function initSudoku() {
    const sudokuElem = document.getElementById('sudoku');
    let boxId = 0;
    let cellId = 0;

    const cells = new Array(81);

    for (let boxY = 0; boxY < 3; boxY++) {
        for (let boxx = 0; boxx < 3; boxx++) {
            const boxElem = document.createElement('div');
            boxElem.id = `box ${boxId++}`;
            boxElem.classList.add('box');
            sudokuElem.appendChild(boxElem);
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    const cellElem = document.createElement('div');
                    cellElem.id = `cell ${cellId++}`;
                    cellElem.classList.add('cell');
                    boxElem.appendChild(cellElem);
                    cells[9 * (3 * boxY + y) + 3 * boxx + x] = cellElem;
                }
            }
        }
    }

    return cells;
}

const sudoku = initSudoku();

function getCell(x, y) {
    return sudoku[9 * y + x];
}

function getValue(x, y) {
    const value = sudoku[9 * y + x].innerText;
    return isNaN(value) ? null : parseInt(value);
}

function setValue(x, y, value) {
    sudoku[9 * y + x].innerText = value;
}

function loadSudoku(event) {
    const file = event.target.files[0];
    if (file) {
        const fr = new FileReader();

        fr.onload = function(e) {
            const content = e.target.result;
            content.split('\n').forEach((row, y) => {
                row.split('').forEach((cell, x) => {
                    if (!isNaN(cell)) {
                        setValue(x, y, cell);
                        getCell(x, y).classList.add('given');
                    }
                })
            });
        }
        
        fr.readAsText(file);

        document.getElementById('solve').removeAttribute('disabled');
    } else {
        console.log("No file selected");
    }
}

document.getElementById('load').addEventListener('change', loadSudoku);

function checkRow(y) {
    const checkedValues = new Array(9).fill(false);

    for (let x = 0; x < 9; x++) {
        const value = getValue(x, y);

        if (value) {
            if (checkedValues[value - 1]) return false;
            checkedValues[value - 1] = true;
        }
    }

    return true;
}

function checkColumn(x) {
    const checkedValues = new Array(9).fill(false);

    for (let y = 0; y < 9; y++) {
        const value = getValue(x, y);

        if (value) {
            if (checkedValues[value - 1]) return false;
            checkedValues[value - 1] = true;
        }
    }

    return true;
}

function checkBox(x, y) {
    const boxX = Math.floor(x / 3);
    const boxY = Math.floor(y / 3);

    const checkedValues = new Array(9).fill(false);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const value = getValue(3 * boxX + i, 3 * boxY + j);
            if (value) {
                if (checkedValues[value - 1]) return false;
                checkedValues[value - 1] = true;
            }
        }
    }

    return true;
}

function findEmptyCell() {
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            const value = getValue(x, y);
            console.log(`Is empty ${x}, ${y}? v=${value}`);
            if (!value) {
                return { x, y };
            }
        }
    }

    return null;
}

function filterOptionsRow(options, y) {
    for (let x = 0; x < 9; x++) {
        const value = getValue(x, y);
        if (value) {
            options[value - 1] = false;
        }
    }
}

function filterOptionsColumn(options, x) {
    for (let y = 0; y < 9; y++) {
        const value = getValue(x, y);
        if (value) {
            options[value - 1] = false;
        }
    }
}

function filterOptionsBox(options, x, y) {
    const boxX = Math.floor(x / 3);
    const boxY = Math.floor(y / 3);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const value = getValue(3 * boxX + i, 3 * boxY + j);
            if (value) {
                options[value - 1] = false;
            }
        }
    }
}

function getCellOptions(x, y) {
    const options = new Array(9).fill(true);

    filterOptionsColumn(options, x);
    filterOptionsRow(options, y);
    filterOptionsBox(options, x, y);
    
    return options;
}

async function solveStep() {
    const nextCell = findEmptyCell();

    if (!nextCell) {
        return true;
    }

    const { x, y } = nextCell;

    console.log(`solving for ${x}, ${y}`);

    for (let value = 1; value <= 9; value++) {
        console.log(`try ${x}, ${y}: ${value}`);
        setValue(x, y, value);
        await new Promise(resolve => setTimeout(resolve, 10));
        
        if (checkColumn(x) && checkRow(y) && checkBox(x, y) && await solveStep()) {
            return true;
        }

        setValue(x, y, '');
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`No value for ${x}, ${y}`);
    return false;
}

function solveSudoku() {
    solveStep();
}

document.getElementById('solve').addEventListener('click', solveSudoku);