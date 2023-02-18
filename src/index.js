import { fromEvent, interval, map } from "rxjs";
import { draw, fieldSize } from "./draw";
import "./styles/main.scss";

const plr1 = document.querySelector(".plr1");
const plr2 = document.querySelector(".plr2");

const points = {
  plr1: 0,
  plr2: 0,
};

const fps = 60;

const defaultValues = {
  ballCoordinates: {
    x: fieldSize.width / 2,
    y: fieldSize.height / 2,
  },
  ballSpeed: {
    x: ((Math.random() * 2 - 1) * 250) / fps,
    y: 230 / fps,
  },
  paddle: {
    height: 20,
    width: 100,
    x: fieldSize.width / 2,
    y: fieldSize.height - 20,
  },
};

const ballCoordinates = Object.assign({}, defaultValues.ballCoordinates);
const ballSpeed = Object.assign({}, defaultValues.ballSpeed);
const paddle = Object.assign({}, defaultValues.paddle);

const refresh = () => {
  defaultValues.ballSpeed.x = ((Math.random() * 2 - 1) * 250) / fps;
  Object.assign(ballCoordinates, defaultValues.ballCoordinates);
  Object.assign(ballSpeed, defaultValues.ballSpeed);
  Object.assign(paddle, defaultValues.paddle);
};
// // {
// // x: fieldSize.width / 2,
// // y: fieldSize.height / 2,
// };

// {
//   x: ((Math.random() * 2 - 1) * 250) / fps,
//   y: 230 / fps,
// };

// {
//   height: 20,
//   width: 100,
//   x: fieldSize.width / 2,
//   y: fieldSize.height - 20,
// };

const paddleSpeed = 800 / fps;

const ballInPaddle = () => {
  if (
    paddle.x + paddle.width / 2 > ballCoordinates.x &&
    paddle.x - paddle.width / 2 < ballCoordinates.x
  )
    return ballCoordinates.y > paddle.y - paddle.height / 2 &&
      ballCoordinates.y < paddle.y + paddle.height / 2
      ? true
      : false;
  return false;
};

const accelerationPart = () => {
  const part = paddle.width / 5;
  switch (Math.floor((paddle.x - ballCoordinates.x) / part)) {
    case -1:
      ballSpeed.y *= 1.3;
      ballSpeed.x = Math.abs(1.2 * ballSpeed.x);
      break;
    case -2:
      ballSpeed.y *= 1.1;
      ballSpeed.x = Math.abs(1.5 * ballSpeed.x);
      break;
    case -3:
      ballSpeed.x = Math.abs(2.5 * ballSpeed.x);
      break;
    case 1:
      ballSpeed.y *= 1.3;
      ballSpeed.x = -Math.abs(1.2 * ballSpeed.x);
      break;
    case 2:
      ballSpeed.y *= 1.1;
      ballSpeed.x = -Math.abs(1.5 * ballSpeed.x);
      break;
    case -3:
      ballSpeed.x = -Math.abs(2.5 * ballSpeed.x);
      break;
    case 0:
      ballSpeed.y *= 1.5;
      break;
  }
};

const paddleTransition = {
  makeTransition: false,
  value: 0,
};

fromEvent(document, "keydown")
  .pipe(map((event) => event.key))
  .subscribe((key) => {
    if (key === "d" || key === "ArrowRight") {
      paddleTransition.makeTransition = true;
      paddleTransition.value = paddleSpeed;
    }
    if (key === "a" || key === "ArrowLeft") {
      paddleTransition.makeTransition = true;
      paddleTransition.value = -paddleSpeed;
    }
  });

fromEvent(document, "keyup")
  .pipe(map((event) => event.key))
  .subscribe((key) => {
    if (
      key === "d" ||
      key === "ArrowRight" ||
      key === "a" ||
      key === "ArrowLeft"
    )
      paddleTransition.makeTransition = false;
  });

interval(1000 / fps).subscribe(() => {
  if (paddleTransition.makeTransition) paddle.x += paddleTransition.value;
  draw(ballCoordinates, paddle);
  if (ballCoordinates.x > fieldSize.width || ballCoordinates.x < 0)
    ballSpeed.x *= -1;
  if (ballCoordinates.y > fieldSize.height || ballCoordinates.y < 0) {
    if (ballCoordinates.y > fieldSize.height) points.plr1++;
    if (ballCoordinates.y < 0) points.plr2++;
    plr1.textContent = points.plr1;
    plr2.textContent = points.plr2;
    refresh();
  }

  // ballSpeed.y *= -1;
  if (ballInPaddle()) {
    accelerationPart();
    ballSpeed.y *= -1;
  }
  ballCoordinates.x += ballSpeed.x;
  ballCoordinates.y += ballSpeed.y;
});
