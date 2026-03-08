const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const introScreen = document.getElementById("introScreen");
const gameContainer = document.querySelector(".game-container");

const box = 20;
let score = 0;
let gameSpeed = 100;
let game; // Variabile per l'intervallo del gioco
let isPaused = false; // 1. NUOVA VARIABILE STATO PAUSA

let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.innerHTML = "Record: " + highScore;

let snake = [{ x: 9 * box, y: 10 * box }];
let food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
};
let d;

// 2. LISTENER TASTIERA AGGIORNATO (Gestisce Pausa + Movimento)
document.addEventListener("keydown", function(event) {
    // Tasto Spazio per Pausa
    if (event.keyCode == 32) {
        if (introScreen.style.display === "none") { // Attiva pausa solo se il gioco è iniziato
            togglePause();
        }
        return; 
    }

    // Direzioni (solo se NON è in pausa)
    if (!isPaused) {
        if(event.keyCode == 37 && d != "RIGHT") d = "LEFT";
        else if(event.keyCode == 38 && d != "DOWN") d = "UP";
        else if(event.keyCode == 39 && d != "LEFT") d = "RIGHT";
        else if(event.keyCode == 40 && d != "UP") d = "DOWN";
    }
});

// 3. FUNZIONI PER LA PAUSA
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(game); // Ferma il loop
        drawPauseScreen();   // Disegna la scritta pausa
    } else {
        game = setInterval(draw, gameSpeed); // Riparte
    }
}

function drawPauseScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; // Sfondo semitrasparente
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSA", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("Premi Spazio per riprendere", canvas.width / 2, canvas.height / 2 + 40);
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#2ecc71" : "#27ae60";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "black";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if( d == "LEFT") snakeX -= box;
    if( d == "UP") snakeY -= box;
    if( d == "RIGHT") snakeX += box;
    if( d == "DOWN") snakeY += box;

    if(snakeX == food.x && snakeY == food.y) {
        score++;
        scoreElement.innerHTML = "Punteggio: " + score;
        food = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", score);
            highScoreElement.innerHTML = "Record: " + score;
            alert("NUOVO RECORD! Hai totalizzato " + score + " punti!");
        } else {
            alert("Game Over! Punteggio finale: " + score);
        }
        
        setTimeout(resetGame, 500); 
        return; 
    }

    snake.unshift(newHead);
}

// 4. FUNZIONE RESET AGGIORNATA
function resetGame() {
    score = 0;
    scoreElement.innerHTML = "Punteggio: 0";
    d = undefined;
    isPaused = false; 
    snake = [{ x: 9 * box, y: 10 * box }];
    food = {
        x: Math.floor(Math.random() * 19 + 1) * box,
        y: Math.floor(Math.random() * 19 + 1) * box
    };
    game = setInterval(draw, gameSpeed);
}

function startGame() {
    introScreen.classList.add("fade-out"); 
    setTimeout(() => {
        introScreen.style.display = "none"; 
        gameContainer.classList.remove("hidden"); 
        game = setInterval(draw, gameSpeed); 
    }, 1000); 
}

setTimeout(startGame, 2500);

let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

// Registra dove inizia il tocco
document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
}, false);

// Registra dove finisce il tocco e calcola la direzione
document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;
    handleGesture();
}, false);

function handleGesture() {
    const deltax = touchendX - touchstartX;
    const deltay = touchendY - touchstartY;

    // Capiamo se lo swipe è stato più orizzontale o verticale
    if (Math.abs(deltax) > Math.abs(deltay)) {
        // Swipe Orizzontale
        if (deltax > 30 && d !== "LEFT") d = "RIGHT";
        else if (deltax < -30 && d !== "RIGHT") d = "LEFT";
    } else {
        // Swipe Verticale
        if (deltay > 30 && d !== "UP") d = "DOWN";
        else if (deltay < -30 && d !== "DOWN") d = "UP";
    }
    
    // Se il tocco è brevissimo (un tap), usalo per la Pausa
    if (Math.abs(deltax) < 10 && Math.abs(deltay) < 10) {
        if (introScreen.style.display === "none") togglePause();
    }
}