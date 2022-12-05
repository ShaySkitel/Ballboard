'use strict'

const COLLECTION_SFX = new Audio('sfx/beep.wav')
const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'
const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/glue.png">'

// Model:
var gBoard
var gGamerPos
var gBallSpawnerIntervalId
var gGlueSpawnerIntervalId
var gScore
var gInPortal
var gCanMove

function onInitGame() {
    clearInterval(gBallSpawnerIntervalId)
    clearInterval(gGlueSpawnerIntervalId)
    gCanMove = true
    gInPortal = false
    gGamerPos = { i: 2, j: 9 }
    resetNearbyBallsCount()
    resetScore()
    gBoard = buildBoard()
    renderBoard(gBoard)
    spawnBalls()
    spawnGlue()
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL

    // LEFT
    board[4][0].type = FLOOR
    // RIGHT
    board[4][11].type = FLOOR
    // TOP
    board[0][5].type = FLOOR
    // BOTTOM
    board[9][5].type = FLOOR

    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            } else if(currCell.gameElement === GLUE){
                strHTML += GLUE_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if(!gCanMove) return
    if (j === -1) {
        gInPortal = true
        j = 11
    } else if (j === 12) {
        gInPortal = true
        j = 0
    }

    if (i === -1) {
        gInPortal = true
        i = 9
    } else if (i === 10) {
        gInPortal = true
        i = 0
    }

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    console.log(jAbsDiff, iAbsDiff)
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || gInPortal) {

        if (targetCell.gameElement === BALL) {
            console.log('Collecting!')
            updateScore()
            COLLECTION_SFX.pause()
            COLLECTION_SFX.currentTime = 0
            COLLECTION_SFX.play()
            if (checkIsGameOver()) {
                clearInterval(gBallSpawnerIntervalId)
                showWinModal()
                return
            }
        } else if(targetCell.gameElement === GLUE){
            gCanMove = false
            setTimeout(() => {
                gCanMove = true
            }, 3000);
        }

        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = { i, j }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)
        gInPortal = false

        showNearbyBallsCount()

    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    // console.log('event.key:', event)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

function getEmptyCells() {
    const cells = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.type === FLOOR && !cell.gameElement) {
                cells.push(cell)
            }
        }
    }
    return cells
}

function getGlueCellsCount() {
    var count = 0

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.gameElement === GLUE) {
                count++
            }
        }
    }
    return count
}

function spawnBalls() {
    gBallSpawnerIntervalId = setInterval(() => {
        const emptyCells = getEmptyCells()
        if (!emptyCells.length) return
        const randIdx = getRandomInt(0, emptyCells.length)
        const randCell = emptyCells[randIdx]

        randCell.gameElement = BALL
        renderBoard(gBoard)
    }, 1500)
}

function spawnGlue() {
    gGlueSpawnerIntervalId = setInterval(() => {
        const emptyCells = getEmptyCells()
        if (!emptyCells.length) return
        const randIdx = getRandomInt(0, emptyCells.length)
        const randCell = emptyCells[randIdx]

        randCell.gameElement = GLUE
        renderBoard(gBoard)
        setTimeout(() => {
            if(randCell.gameElement === GLUE){
                randCell.gameElement = null
                renderBoard(gBoard)
            }
        }, 3000);
    }, 5000)
}

function updateScore() {
    const elScoreSpan = document.querySelector('h2 span')
    gScore++

    elScoreSpan.innerText = gScore
}

function resetScore() {
    const elScoreSpan = document.querySelector('h2 span')
    gScore = 0
    elScoreSpan.innerText = gScore
}

function checkIsGameOver() {
    const emptyCells = getEmptyCells()
    return emptyCells.length === (gBoard.length - 2) * (gBoard[0].length - 2) + 2 - getGlueCellsCount()
}

function showWinModal() {
    const elWinModal = document.querySelector('.win-modal')
    const elGameContainer = document.querySelector('.game-container')

    elGameContainer.classList.add('hidden')
    elWinModal.classList.remove('hidden')
}

function hideWinModal() {
    const elWinModal = document.querySelector('.win-modal')
    const elGameContainer = document.querySelector('.game-container')

    elWinModal.classList.add('hidden')
    elGameContainer.classList.remove('hidden')
}

function onRestart() {
    hideWinModal()
    onInitGame()
}

function getNearbyBallsCount() {
    var count = 0
    const neighborCells = getNeighborsInMat(gBoard, gGamerPos)
    for (var i = 0; i < neighborCells.length; i++) {
        const cell = neighborCells[i]
        if (cell.gameElement === BALL) count++
    }

    return count
}

function showNearbyBallsCount(){
    const elH1Span = document.querySelector('h1 span')
    elH1Span.innerText = getNearbyBallsCount()
}

function resetNearbyBallsCount(){
    const elH1Span = document.querySelector('h1 span')
    elH1Span.innerText = 0
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}