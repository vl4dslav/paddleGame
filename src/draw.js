export const fieldSize = {
  width: 1000,
  height: 1000,
};

const radius = 10;

const canvas = document.querySelector("canvas");
canvas.width = fieldSize.width;
canvas.height = fieldSize.height;
canvas.style.backgroundColor = "black";
const ctx = canvas.getContext("2d");

const drawBall = (x, y) => {
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
};

const drawField = () => {
  ctx.beginPath();
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, fieldSize.width, fieldSize.height);
};

const drawPaddle = (paddle) => {
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.fillRect(
    paddle.x - paddle.width / 2,
    paddle.y - paddle.height / 2,
    paddle.width,
    paddle.height
  );
};

export const draw = (
  ballCoordinates = {
    x: fieldSize.width / 2,
    y: fieldSize.height / 2,
  },
  paddle = {
    height: 20,
    width: 100,
    x: fieldSize.width / 2,
    y: fieldSize.height - 20,
  }
) => {
  drawField();
  drawBall(ballCoordinates.x, ballCoordinates.y);
  drawPaddle(paddle);
};
