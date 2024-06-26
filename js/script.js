const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const score = document.querySelector(".score--value");
const finalscore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonplay = document.querySelector(".btn-play");

const audio = new Audio('../assets/assets_audio.mp3');

const size = 30;

const initialPosition = { x: 270, y: 240 };

let snake = [initialPosition];

const incrementScore = () => {
    score.innerText = +score.innerText + 10;
};

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / 30) * 30;
};

const randomColor = () => {
    const red = randomNumber(0, 255);
    const green = randomNumber(0, 255);
    const blue = randomNumber(0, 255);

    return `rgb(${red}, ${green}, ${blue})`;
};

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
};

let direction = "";
let loopId;

const drawFood = () => {
    const { x, y, color } = food;

    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, size, size);
    ctx.shadowBlur = 0;
};

const drawSnake = () => {
    ctx.fillStyle = "#ddd";

    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "blue";
        }

        ctx.fillRect(position.x, position.y, size, size);
    });
};

const moveSnake = () => {
    if (!direction) return;
    const head = snake[snake.length - 1];

    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y });
    }

    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y });
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size });
    }

    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size });
    }

    snake.shift();
};

const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.lineTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineTo(0, i);
        ctx.lineTo(600, i);
        ctx.stroke();
    }
};

const createGraph = (width, height, size) => {
    const graph = {};
    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            const nodeId = `${x},${y}`;
            graph[nodeId] = [];

            if (x > 0) graph[nodeId].push(`${x - size},${y}`);
            if (x < width - size) graph[nodeId].push(`${x + size},${y}`);
            if (y > 0) graph[nodeId].push(`${x},${y - size}`);
            if (y < height - size) graph[nodeId].push(`${x},${y + size}`);
        }
    }
    return graph;
};

const graph = createGraph(canvas.width, canvas.height, size);

const isValidFoodPositionUsingGraph = (foodPosition, snake) => {
    const foodNodeId = `${foodPosition.x},${foodPosition.y}`;
    return !snake.some(segment => `${segment.x},${segment.y}` === foodNodeId);
};

const generateValidFoodPositionUsingGraph = (canvas, snake, size) => {
    let position;

    do {
        position = {
            x: randomPosition(),
            y: randomPosition()
        };
    } while (!isValidFoodPositionUsingGraph(position, snake));

    return position;
};

const checkEatWithGraph = () => {
    const head = snake[snake.length - 1];

    if (head.x == food.x && head.y == food.y) {
        incrementScore();
        snake.push(head);
        audio.play();

        let newPosition = generateValidFoodPositionUsingGraph(canvas, snake, size);
        food.x = newPosition.x;
        food.y = newPosition.y;
        food.color = randomColor();
    }
};

const checkCollision = () => {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size;
    const neckIndex = snake.length - 2;

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y;
    });
    if (wallCollision || selfCollision) {
        gameOver();
    }
};

const gameloop = () => {
    clearInterval(loopId);

    ctx.clearRect(0, 0, 600, 600);
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEatWithGraph();
    checkCollision();

    loopId = setTimeout(() => {
        gameloop();
    }, 300);
};

const gameOver = () => {
    direction = undefined;

    menu.style.display = "flex";
    finalscore.innerText = score.innerText;
    canvas.style.filter = "blur(2px)";
};

gameloop();

document.addEventListener("keydown", ({ key }) => {

    if (key == "ArrowRight" && direction != "left") {
        direction = "right";
    }

    if (key == "ArrowLeft" && direction != "right") {
        direction = "left";
    }

    if (key == "ArrowDown" && direction != "up") {
        direction = "down";
    }

    if (key == "ArrowUp" && direction != "down") {
        direction = "up";
    }

});

buttonplay.addEventListener("click", () => {
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";

    snake = [initialPosition];
    direction = "";
    let newPosition = generateValidFoodPositionUsingGraph(canvas, snake, size);
    food.x = newPosition.x;
    food.y = newPosition.y;
    food.color = randomColor();
    gameloop();
});