// --- DOM Element Selections ---
let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let newGameBtn = document.querySelector("#new-btn");
let homeBtn = document.querySelector("#home-btn");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
const scoreOElem = document.querySelector("#score-o");
const scoreXElem = document.querySelector("#score-x");
const scoreDrawElem = document.querySelector("#score-draw");
const resetScoreBtn = document.querySelector("#reset-score-btn");

// Game Mode Selection DOM
let modeChoiceContainer = document.querySelector(".mode-choice-container");
let chooseAiBtn = document.querySelector("#choose-ai");
let chooseTwoPlayerBtn = document.querySelector("#choose-two-player");

// AI Difficulty Selection DOM
let aiDifficultyContainer = document.querySelector(".ai-difficulty-container");
let levelEasyBtn = document.querySelector("#level-easy");
let levelMediumBtn = document.querySelector("#level-medium");
let levelHardBtn = document.querySelector("#level-hard");

// Player Symbol Choice DOM
let playerChoiceContainer = document.querySelector(".player-choice-container");
let chooseXBtn = document.querySelector("#choose-x");
let chooseOBtn = document.querySelector("#choose-o");

// Select the "Turn" and "For" h3 elements
let H1Elem = document.querySelector("#H1");
let H2Elem = document.querySelector("#H2");

// All general game elements that need to be hidden/shown together
let gameContainers = document.querySelectorAll("#H1, #H2, .turn-container, .scoreboard, .container, .msg-container, .button");


// --- Constants ---
const MODE_AI = "AI";
const MODE_TWO_PLAYER = "TWO_PLAYER";

const LEVEL_EASY = "EASY";
const LEVEL_MEDIUM = "MEDIUM";
const LEVEL_HARD = "HARD";

const WIN_PATTERNS = [
    [0, 1, 2], [0, 3, 6], [0, 4, 8],
    [1, 4, 7], [2, 5, 8], [2, 4, 6],
    [3, 4, 5], [6, 7, 8],
];

// --- Game State Variables ---
let currentGameMode;
let currentAiLevel;
let playerSymbol;
let aiSymbol;
let turn = "X";
let turnX = true;

let scoreO = 0;
let scoreX = 0;
let scoreDraw = 0;

// --- Helper Functions ---
function updateScoreboard() {
    scoreOElem.textContent = `O:${scoreO}`;
    scoreXElem.textContent = `X:${scoreX}`;
    scoreDrawElem.textContent = `Draws:${scoreDraw}`;
}

function disableBoxes() {
    for (let box of boxes) {
        box.disabled = true;
    }
}

function enableBoxes() {
    for (let box of boxes) {
        box.disabled = false;
        box.innerText = "";
        box.style.backgroundColor = "";
        box.classList.remove("win-animate");
    }
}

function changeTurn() {
    if(turn === "X") {
        turn = "O";
        document.querySelector(".bg").style.left = "85px";
    } else {
        turn = "X";
        document.querySelector(".bg").style.left = "0px";
    }
}

// Function to reset scores
function resetScores() {
    scoreO = 0;
    scoreX = 0;
    scoreDraw = 0;
    updateScoreboard();
}

// --- Screen Management Functions ---
function showModeChoiceScreen() {
    modeChoiceContainer.classList.remove("hide");
    aiDifficultyContainer.classList.add("hide");
    playerChoiceContainer.classList.add("hide");
    gameContainers.forEach(el => el.classList.add("hide"));
    msgContainer.classList.add("hide");
    enableBoxes();
}

function showAiDifficultyScreen() {
    modeChoiceContainer.classList.add("hide");
    aiDifficultyContainer.classList.remove("hide");
    playerChoiceContainer.classList.add("hide");
    gameContainers.forEach(el => el.classList.add("hide"));
    msgContainer.classList.add("hide");
    enableBoxes();
}

function showPlayerChoiceScreen() {
    modeChoiceContainer.classList.add("hide");
    aiDifficultyContainer.classList.add("hide");
    playerChoiceContainer.classList.remove("hide");
    gameContainers.forEach(el => el.classList.add("hide"));
    msgContainer.classList.add("hide");
    enableBoxes();
}

function showGameScreen() {
    modeChoiceContainer.classList.add("hide");
    aiDifficultyContainer.classList.add("hide");
    playerChoiceContainer.classList.add("hide");
    gameContainers.forEach(el => el.classList.remove("hide"));
}

// --- Game Logic Functions ---
function showWinner(winner, pattern) {
    msg.innerText = `${winner} Wins!`;
    msgContainer.classList.remove("hide");
    disableBoxes();

    if (winner === "O") scoreO++;
    if (winner === "X") scoreX++;
    updateScoreboard();

    pattern.forEach((idx) => {
        boxes[idx].style.backgroundColor = "#08D9D6";
    });
}

function showDraw() {
    msg.textContent = "It's a Draw!";
    msgContainer.classList.remove("hide");
    disableBoxes();

    scoreDraw++;
    updateScoreboard();
}

function checkWinner() {
    let isGameWon = false;

    for (let pattern of WIN_PATTERNS) {
        let pos1val = boxes[pattern[0]].innerText;
        let pos2val = boxes[pattern[1]].innerText;
        let pos3val = boxes[pattern[2]].innerText;

        if (pos1val !== "" && pos2val !== "" && pos3val !== "") {
            if (pos1val === pos2val && pos2val === pos3val) {
                showWinner(pos1val, pattern);
                isGameWon = true;
                return;
            }
        }
    }

    if (!isGameWon && Array.from(boxes).every(box => box.innerText !== "")) {
        showDraw();
    }
}

// --- AI Logic (Difficulty-Based) ---

function getAvailableMoves() {
    let available = [];
    boxes.forEach((box, index) => {
        if (box.innerText === "") {
            available.push(index);
        }
    });
    return available;
}

function getStrategicWinOrBlockMove(symbol, available) {
    for (let pattern of WIN_PATTERNS) {
        let [a, b, c] = pattern;
        let lineValues = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];

        if (lineValues.filter(val => val === symbol).length === 2 && lineValues.filter(val => val === "").length === 1) {
            if (lineValues[0] === "" && available.includes(a)) return a;
            if (lineValues[1] === "" && available.includes(b)) return b;
            if (lineValues[2] === "" && available.includes(c)) return c;
        }
    }
    return -1;
}

function getForkMove(symbol, available) {
    for (let move of available) {
        boxes[move].innerText = symbol;
        let forkCount = 0;
        for (let pattern of WIN_PATTERNS) {
            let [a, b, c] = pattern;
            let currentValues = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
            if (currentValues.filter(val => val === symbol).length === 2 && currentValues.filter(val => val === "").length === 1) {
                forkCount++;
            }
        }
        boxes[move].innerText = "";
        if (forkCount >= 2) return move;
    }
    return -1;
}

function getBlockingForkMove(opponentSymbol, available) {
    for (let move of available) {
        boxes[move].innerText = aiSymbol;
        let opponentPotentialFork = false;
        let tempAvailable = available.filter(idx => idx !== move);

        for (let opponentMove of tempAvailable) {
            boxes[opponentMove].innerText = opponentSymbol;
            let forkCount = 0;
            for (let pattern of WIN_PATTERNS) {
                let [a, b, c] = pattern;
                let currentValues = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
                if (currentValues.filter(val => val === opponentSymbol).length === 2 && currentValues.filter(val => val === "").length === 1) {
                    forkCount++;
                }
            }
            if (forkCount >= 2) {
                opponentPotentialFork = true;
            }
            boxes[opponentMove].innerText = "";
            if (opponentPotentialFork) break;
        }
        boxes[move].innerText = "";
        if (!opponentPotentialFork) {
            return move;
        }
    }
    return -1;
}

function getCenterCornerSideMove(available) {
    if (available.includes(4)) return 4;

    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (available.includes(corner)) return corner;
    }

    const sides = [1, 3, 5, 7];
    for (let side of sides) {
        if (available.includes(side)) return side;
    }
    return -1;
}

function aiMove() {
    const available = getAvailableMoves();
    if (available.length === 0) return;

    let move = -1;

    switch (currentAiLevel) {
        case LEVEL_EASY:
            // Random move
            move = available[Math.floor(Math.random() * available.length)];
            break;

        case LEVEL_MEDIUM:
            // 50% chance of making a strategic move
            if (Math.random() < 0.5) {
                move = getStrategicMove();
            } else {
                move = available[Math.floor(Math.random() * available.length)];
            }
            break;

        case LEVEL_HARD:
            // Always make the best move
            move = getStrategicMove();
            break;
    }

    if (move !== -1) {
        boxes[move].innerText = aiSymbol;
        checkWinner();
        if (!msgContainer.classList.contains("hide")) return;
        changeTurn();
    }
}

function getStrategicMove() {
    const available = getAvailableMoves();
    
    // Try to win
    let move = getStrategicWinOrBlockMove(aiSymbol, available);
    if (move !== -1) return move;

    // Try to block player's win
    move = getStrategicWinOrBlockMove(playerSymbol, available);
    if (move !== -1) return move;

    // Try to create a fork
    move = getForkMove(aiSymbol, available);
    if (move !== -1) return move;

    // Try to block player's fork
    move = getBlockingForkMove(playerSymbol, available);
    if (move !== -1) return move;

    // Take center, corner, or side
    return getCenterCornerSideMove(available);
}

// --- Event Listeners ---

// Game Mode Selection
chooseAiBtn.addEventListener("click", () => {
    currentGameMode = MODE_AI;
    showAiDifficultyScreen();
});

chooseTwoPlayerBtn.addEventListener("click", () => {
    currentGameMode = MODE_TWO_PLAYER;
    startGame();
});

// AI Difficulty Selection
levelEasyBtn.addEventListener("click", () => {
    currentAiLevel = LEVEL_EASY;
    showPlayerChoiceScreen();
});

levelMediumBtn.addEventListener("click", () => {
    currentAiLevel = LEVEL_MEDIUM;
    showPlayerChoiceScreen();
});

levelHardBtn.addEventListener("click", () => {
    currentAiLevel = LEVEL_HARD;
    showPlayerChoiceScreen();
});

// Player Symbol Choice (for AI mode)
chooseXBtn.addEventListener("click", () => {
    if (currentGameMode === MODE_AI) {
        playerSymbol = "X";
        aiSymbol = "O";
        startGame();
    }
});

chooseOBtn.addEventListener("click", () => {
    if (currentGameMode === MODE_AI) {
        playerSymbol = "O";
        aiSymbol = "X";
        startGame();
    }
});

// Add click event listeners to all boxes
boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (box.innerText === "") {
            box.innerText = turn;
            checkWinner();
            
            if (currentGameMode === MODE_AI && !msgContainer.classList.contains("hide")) {
                return;
            }
            
            changeTurn();
            
            if (currentGameMode === MODE_AI && turn === aiSymbol) {
                setTimeout(aiMove, 500);
            }
        }
    });
});

// Control Buttons
newGameBtn.addEventListener("click", () => {
    enableBoxes();
    msgContainer.classList.add("hide");
    turn = "X";
    document.querySelector(".bg").style.left = "0px";
});

resetBtn.addEventListener("click", () => {
    enableBoxes();
    msgContainer.classList.add("hide");
    turn = "X";
    document.querySelector(".bg").style.left = "0px";
});

resetScoreBtn.addEventListener("click", resetScores);

homeBtn.addEventListener("click", () => {
    showModeChoiceScreen();
    resetScores();
});

// Add sound test functionality
const testSoundBtn = document.querySelector("#test-sound-btn");
testSoundBtn.addEventListener("click", () => {
    console.log("Testing sounds...");
    playSound('click');
    setTimeout(() => playSound('turn'), 500);
    setTimeout(() => playSound('win'), 1000);
    setTimeout(() => playSound('draw'), 1500);
});

// --- Game Initialization ---
function startGame() {
    showGameScreen();
    enableBoxes();
    turn = "X";
    document.querySelector(".bg").style.left = "0px";
    msgContainer.classList.add("hide");

    // If AI is X, make it play first
    if (currentGameMode === MODE_AI && aiSymbol === "X") {
        setTimeout(aiMove, 500);
    }
}

// Initialize the game
showModeChoiceScreen();
updateScoreboard();