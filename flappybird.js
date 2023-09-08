//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let firstPlay = true;

//bird
let birdWidth = 40;
let birdHeight = 34;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImgs = [];
let currentBirdImgIndex = 0;
let birdFrameChangeRate = 10;
let birdFrameChangeCounter = 0;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -4;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let gameStarted = false; // New: added for checking game start status
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //load images
    birdImgs[0] = new Image();
    birdImgs[0].src = "./rocky1.png";
    birdImgs[1] = new Image();
    birdImgs[1].src = "./rocky2.png";
    birdImgs[2] = new Image();
    birdImgs[2].src = "./rocky3.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

//    requestAnimationFrame(update);
    setInterval(placePipes, 1100); //every 1.1 seconds
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) { // Changed to check for gameStarted
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    if (gameStarted) {
        velocityY += gravity; 
    }
    bird.y = Math.max(bird.y + velocityY, 0);

    birdFrameChangeCounter++;
    if(birdFrameChangeCounter >= birdFrameChangeRate) {
        currentBirdImgIndex = (currentBirdImgIndex + 1) % birdImgs.length;
        birdFrameChangeCounter = 0;
    }
    context.drawImage(birdImgs[currentBirdImgIndex], bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    if(gameStarted) {
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5;
                pipe.passed = true;
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
            }
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver || !gameStarted) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/6;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        velocityY = -7;

        if (!gameStarted && firstPlay) {
            gameStarted = true;
            firstPlay = false;
            requestAnimationFrame(update);
        }
        

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            gameStarted = true;  // Reset game state
        }
    }
}

function detectCollision(a, b) {
    let hitboxReduction = 0.07;  
    let hitboxWidth = a.width * hitboxReduction;
    let hitboxHeight = a.height * hitboxReduction;

    return a.x + hitboxWidth < b.x + b.width &&
           a.x + a.width - hitboxWidth > b.x &&
           a.y + hitboxHeight < b.y + b.height &&
           a.y + a.height - hitboxHeight > b.y;
}
