/**Board variables */
const board = document.getElementById("board"), 
boardWidth = 400, boardHeight = 630, 
boardContext = board.getContext("2d"),
/**Bird Variables. Original Width is 408 and original height 
 * is 228. 408/228 ration is equivalent of 17/12. 34/24 ratio
 * is also equivalent to 17/12.
 */
birdWidth = 34,
birdHeight = 24,
/**Birds X and Y co-ordinates */
birdX = boardWidth / 8,
birdY = boardHeight / 2;

/**Creating a javascript object for flappy bird */
let flappyBird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
},
flappyBirdImage,
/**Creating Pipe Array to store multiple pipes */
pipeArray = [],
/**Pipe width is 384 and pipe height is 3072. So, 
 * 384/3072 ration is equivalent to 1/8. 64/512 ration
 *  is equal to 1/8.*/
pipeWidth = 64, pipeHeight = 512, 
/**Setting up X and Y co-ordinates for pipes */
pipeX = boardWidth,
pipeY = 0,
topPipeImage, bottomPipeImage,
/**Game Physics.
 * Speed of Pipes moving towards left direction. */ 
velocityX = -2,
/**Setting up velocity Y for the flappy bird so that it can fly.
 * This the the flappy bird's jump speed.*/
velocityY = 0,
/**Adding Gravity value so that we can bring the flappy
 * bird down towards the ground instead of letting it fly
 * continuously upwards.*/
gravity = 0.4,
/**Creating a varibale to catch a collision which will 
 * indicate the game is over*/
gameOver = false,
score = 0;


window.onload = firstStart();

function firstStart() {
    board.width = boardWidth;
    board.height = boardHeight;

    // boardContext.fillStyle = "green";
    // boardContext.fillRect(flappyBird.x, 
    //     flappyBird.y, 
    //     flappyBird.width, 
    //     flappyBird.height);

        /**Drawing and Loading Flappy Bird Image */
        flappyBirdImage = new Image();
        flappyBirdImage.src = "./images/flappybird.png";
        flappyBirdImage.onload = function() {
            boardContext.drawImage(flappyBirdImage,
                flappyBird.x,
                flappyBird.y,
                flappyBird.width,
                flappyBird.height);
        };

        /**Drawing and Loading To and Bottom Pipe Images*/
        topPipeImage = new Image();
        topPipeImage.src = "./images/toppipe.png";

        bottomPipeImage = new Image();
        bottomPipeImage.src = "./images/bottompipe.png";

       requestAnimationFrame(update);
       /**Calling the functions to draw pipes every
        * 1500 miliseconds or 1.5 seconds repeatedly.*/
       setInterval(placePipes, 1500);
       /**Adding a event listener */
       document.addEventListener("keydown", moveBird);
};

function update() {
    requestAnimationFrame(update);
    /**If game is over then stop the game and stop painting 
     * more cavas frames.*/
    if (gameOver) {
        return;
    }
    /**Clearing the previous frame to prevent the newer frame
     * will start stacking up on the older frame. It will
     * put a burden on the system memory.*/
    boardContext.clearRect(0, 0, boardWidth, boardHeight);

    /**Updating flappy bird's velocity y position*/
    velocityY += gravity;
    /**Putting a limit on flappy bird fly direction while going
     * upwards. 0 represents maximum value or the top wall of the canvas and
     * flappyBird.y + velocityY represents the area within the canvas.*/
    flappyBird.y = Math.max(flappyBird.y + velocityY, 0);
    //flappyBird.y += velocityY;
    /**Drawing the flappy bird image over and over again.*/
    boardContext.drawImage(flappyBirdImage,
        flappyBird.x,
        flappyBird.y,
        flappyBird.width,
        flappyBird.height);

        /**Checking if the flappy bird has touched the ground or not.
         * If it is then it will be game Over. If flappy bird's Y 
         * position is greater than the height of canvas which means if
         * flappy bird touches the bottom wall then the game will be over.*/
        if (flappyBird.y > board.height) {
            gameOver = true;
        }
    /**Drawing the top pipe image over and over again.*/
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        /**Updating pipe's x position before drawing it.*/
        pipe.x += velocityX;
        boardContext.drawImage(pipe.img,
            pipe.x,
            pipe.y,
            pipe.width,
            pipe.height);

            /**Updating the scroe if the bird has passed a set of pipes.
             * Checking flappy bird's x position by comparing with the pipe's
             * x position on the left side and adding total pipe's width to it.
             * If flappy bird's x position is greater than the pipe.x + pipe.width
             * then adding and updating 1 score point. Basically, once the bird's x
             * position passed the furthest x position on the right side of the pipe
             * then reward 1 score point for the player.*/
            if (!pipe.passed && flappyBird.x > pipe.x + pipe.width) {
                /**We are writing 0.5 because there are two pipes and the 
                 * function will count 1 points for each pipe which will give 
                 * 2 points to the player. Instead we are adding half point which will
                 * equal to 1 point if the flappy bird passes two pipes which are top pipe
                 * bottom pipe.*/
                score += 0.5;
                /**To prevent the function from double checking whether the bird has passed
                 * the pipe or not we are making the pipe.passed = true.*/
                pipe.passed = true;
            }

            /**Detecting the collision between flappy bird and
             * the pipes. If collision found then the game will be over.*/
            if (detectCollision(flappyBird, pipe)) {
                gameOver = true;
            }        
    };

    /**Clearing the pipe which have gone past the screen. If the first set of
     * pipe has passed the screen of the left side wall of the canvas or not.*/
    while (pipeArray.length > 0 && pipeArray[0].x < 0 - pipeWidth ) {
        /**pipearray.shift function removes the first element from the array*/
        pipeArray.shift();       
    };
    /**Drawing and designing the Score content.*/
    boardContext.fillStyle = "black";
    boardContext.font = "45px sans-serif";
    /**Setting up the x and y co-ordinates for displaying the score on the canvas.*/
    boardContext.fillText(score, 5, 45);

    /**Displaying the Game over message on the screen. Setting up x position at 5 and
    y position at 90*/
    if (gameOver) {
        boardContext.fillText("Game Over", 5, 90);
    }
};

function placePipes() {
    /**If game is over then stop the game and stop painting 
     * more cavas frames.*/
    if (gameOver) {
        return;
    }
    /**Here pipeY = 0 , 
     * pipeHeight / 4 = 512 /4 = 128,
     * pipeHeight / 2 = 512 / 2 = 256
     * Creating random height size for the pipes.*/
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    
    /**Defining the opening space gap for the bird to travel through.*/
    let openingSpace = boardHeight / 4;

    /**Defining Top pipe object*/
    let topPipe = {
        img : topPipeImage,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };
    /**Adding the topPipe object to Pipe array. */
     pipeArray.push(topPipe);

     
    /**Defining Bottom pipe object*/
    let bottomPipe = {
        img : bottomPipeImage,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    };
    /**Adding the bottomPipe object to Pipe array. */
    pipeArray.push(bottomPipe);
};

function moveBird(e) {
    if (e.code === "Space" || 
    e.code === "ArrowUp" || 
    e.code === "KeyX") {
        /**Code to make the flappy bird jump or fly upwards*/
        velocityY = -6;

        /**Resetting the game with the same keys the player will 
         * use to control the flappy bird's movement.*/
        if (gameOver) {
            flappyBird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
};

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
};