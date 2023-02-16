import { fromEvent, interval, map } from "rxjs";
import { draw, fieldSize } from "./draw";
import "./styles/main.scss";

const fps = 100;

const ballCoordinates = {
  x: fieldSize.width / 2,
  y: fieldSize.height / 2,
};

const ballSpeed = {
  x: 150 / fps,
  y: 130 / fps,
};

const paddle = {
  height: 20,
  width: 100,
  x: fieldSize.width / 2,
  y: fieldSize.height - 20,
};

const paddleSpeed = 4000 / fps;

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

fromEvent(document, "keydown")
  .pipe(map((event) => event.key))
  .subscribe((key) => {
    if (key === "d" || key === "ArrowRight") paddle.x += paddleSpeed;
    if (key === "a" || key === "ArrowLeft") paddle.x -= paddleSpeed;
  });

interval(1000 / fps).subscribe(() => {
  draw(ballCoordinates, paddle);
  if (ballCoordinates.x > fieldSize.width || ballCoordinates.x < 0)
    ballSpeed.x *= -1;
  if (ballCoordinates.y > fieldSize.height || ballCoordinates.y < 0)
    ballSpeed.y *= -1;
  if (ballInPaddle()) ballSpeed.y *= -1;
  ballCoordinates.x += ballSpeed.x;
  ballCoordinates.y += ballSpeed.y;
});
