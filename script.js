// Initialise the sudoku
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

// Load sudoku
document.getElementById('load').addEventListener('change', function(event) {
    clearSudoku();

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

        document.getElementById('solve').toggleAttribute('disabled', false);
    } else {
        console.error("No file selected");
    }
});

/**
 * Clear the sudoku.
 */
function clearSudoku() {
    cells.forEach(cell => {
        cell.innerText = '';
        cell.classList.remove('given');
    });
}

/**
 * Get the cell at the given coordinates.
 * @param {number} x X-coordinate of the cell.
 * @param {number} y Y-coordinate of the cell.
 * @returns {HTMLElement} HTMLElement of the cell.
 */
function getCell(x, y) {
    return cells[9 * y + x];
}

/**
 * Get the value of the given cell. If the cell is empty, return null.
 * @param {number} x X-coordinate of the cell.
 * @param {number} y Y-coordinate of the cell.
 * @returns {number | null}
 */
function getValue(x, y) {
    const value = cells[9 * y + x].innerText;
    return isNaN(value) ? null : parseInt(value, 10);
}

/**
 * Set the value of the given cell.
 * @param {number} x X-coordinate of the cell.
 * @param {number} y Y-coordinate of the cell.
 * @param {number | string} value 
 */
function setValue(x, y, value) {
    cells[9 * y + x].innerText = value;
}

/**
 * Check if the row at the given y-coordinate is correct.
 * @param {number} y Row index
 * @returns {boolean}
 */
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

/**
 * Check if the column at the given x-coordinate is correct.
 * @param {number} x Column index
 * @returns {boolean}
 */
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

/**
 * Check if the box that the coordinate is in is correct.
 * @param {number} x X-coordinate of the cell.
 * @param {number} y Y-coordinate of the cell.
 * @returns {boolean}
 */
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

/**
 * Find the next cell to process. This is the cell with the least
 * amount of options. Return null if there are no more cells to fill.
 * @param {Map<number, Array<number>>} options 
 * @returns {number | null} The cell key: 9 * y + x 
 */
function findNextCell(options) {
    let nextCell = null;
    let minOptions = Infinity;

    options.forEach((cellOptions, cell) => {
        if (cellOptions.length < minOptions) {
            nextCell = cell;
            minOptions = cellOptions.length;
        }
    });

    return nextCell;
}

/**
 * Get the optional values of the given cell.
 * @param {number} x 
 * @param {number} y 
 * @returns {Array<number>} Optional values.
 */
function getCellOptions(x, y) {
    const options = new Array(9).fill(true);

    filterOptionsColumn(options, x);
    filterOptionsRow(options, y);
    filterOptionsBox(options, x, y);
    
    const values = [];

    for (let value = 1; value <= 9; value++) {
        if (options[value - 1]) {
            values.push(value);
        }
    }

    return values;
}

/**
 * Filter the cell options based the row.
 * @param {Array<boolean>} cellOptions Array of length 9, where each value is stored
 * at index (value - 1).
 * @param {number} y Row index
 */
function filterOptionsRow(cellOptions, y) {
    for (let x = 0; x < 9; x++) {
        const value = getValue(x, y);
        if (value) {
            cellOptions[value - 1] = false;
        }
    }
}

/**
 * Filter the cell options based the column.
 * @param {Array<boolean>} cellOptions Array of length 9, where each value is stored
 * at index (value - 1).
 * @param {number} x Column index
 */
function filterOptionsColumn(options, x) {
    for (let y = 0; y < 9; y++) {
        const value = getValue(x, y);
        if (value) {
            options[value - 1] = false;
        }
    }
}

/**
 * Filter the cell options based the box.
 * @param {Array<boolean>} cellOptions Array of length 9, where each value
 * is stored at index (value - 1).
 * @param {number} x X-coordinate of the cell.
 * @param {number} y Y-coordinate of the cell.
 */
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

/**
 * Update the cell options by removing the value from the cell options
 * in the row, column and box. Return a list of all the cells where
 * the option is removed from, so the change can be undone.
 * @param {Map<number, Array<number>>} cellOptions 
 * @param {number} x X-coordinate of the filled-in cell.
 * @param {number} y Y-coordinate of the filled-in cell.
 * @param {number} value Value that has been filled in.
 * @returns {Array<string>} List of cell keys which options have been altered.
 */
function updateOptions(cellOptions, x, y, value) {
    const changes = [];
    let cellKey;
    for (let i = 0; i < 9; i++) {
        // Check for each cell in the row
        cellKey = 9 * y + i;
        if (cellOptions.has(cellKey) && cellOptions.get(cellKey).includes(value)) {
            const index = cellOptions.get(cellKey).findIndex(v => v === value);
            cellOptions.get(cellKey).splice(index, 1);
            changes.push(cellKey);
        }

        // Check for each cell in the column
        cellKey = 9 * i + x;
        if (cellOptions.has(cellKey) && cellOptions.get(cellKey).includes(value)) {
            const index = cellOptions.get(cellKey).findIndex(v => v === value);
            cellOptions.get(cellKey).splice(index, 1);
            changes.push(cellKey);
        }
    }

    // Check for all cells in the box
    const boxX = Math.floor(x / 3);
    const boxY = Math.floor(y / 3);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const xi = 3 * boxX + i;
            const yj = 3 * boxY + j;

            cellKey = 9 * yj + xi;
            if (cellOptions.has(cellKey) && cellOptions.get(cellKey).includes(value)) {
                const index = cellOptions.get(cellKey).findIndex(v => v === value);
                cellOptions.get(cellKey).splice(index, 1);
                changes.push(cellKey);
            }
        }
    }

    return changes;
}

/**
 * Solve the sudoku recursively. At each step, get the next cell to fill in
 * and try all possible values. Check if the next step succeeds as well. If
 * so, the sudoku is complete. If not, set the cell as empty and go back a step.
 * @param {Map<number, Array<number>>} cellOptions 
 * @returns {Promise<boolean>} ```true``` if the sudoku is correct, otherwise ```false```.
 */
async function solveStep(cellOptions) {
    const cellKey = findNextCell(cellOptions);

    if (!cellKey) {
        // No empty cells, the sudoku is complete
        return true;
    }

    const x = cellKey % 9;
    const y = Math.floor(cellKey / 9);

    // Remove the cell options from the Map
    const options = cellOptions.get(cellKey);
    cellOptions.delete(cellKey);

    for (const value of options) {
        setValue(x, y, value);
        const changes = updateOptions(cellOptions, x, y, value);
        // Set an await, so the DOM can update.
        await new Promise(resolve => setTimeout(resolve, 10));

        if (await solveStep(cellOptions)) {
            return true;
        }
        
        // Set back the option for each cell where the option was removed.
        changes.forEach((removedCell) => cellOptions.get(removedCell).push(value));
    }

    // All options incorrect. Reset the value of the cell.
    setValue(x, y, '');
    await new Promise(resolve => setTimeout(resolve, 10));

    // Set the cell options back in the Map
    cellOptions.set(cellKey, options)
    return false;
}

/**
 * Get the cell options of all the cells and put them into a Map, where
 * the key is cell index in cells.
 * @returns {Map<number, Array<number>>}
 */
function getAllCellOptions() {
    const cellOptions = new Map();

    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (getValue(x, y)) continue;

            const options = getCellOptions(x, y);
            cellOptions.set(9 * y + x, options);
        }
    }

    return cellOptions;
}

/**
 * Display the result.
 * @param {boolean} succeeded Whether the sudoku could be solved or not.
 */
function showResult(succeeded) {
    const resultElem = document.getElementById('result');
    resultElem.style.display = 'block';
    resultElem.innerText = succeeded ? 'Solved!' : 'No solution.'
    resultElem.classList.add(succeeded ? 'correct' : 'incorrect');
}

function clearResult() {
    const resultElem = document.getElementById('result');
    resultElem.classList.remove('correct', 'incorrect');
    resultElem.style.display = 'none;'
}

// Add start function to click event
document.getElementById('solve').addEventListener('click', async function() {
    document.getElementById('solve').toggleAttribute('disabled');
    const cellOptions = getAllCellOptions();
    const result = await solveStep(cellOptions);
    showResult(result);
});
