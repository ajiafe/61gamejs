let bricks, paddle, ball;
const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  heigth: 600,
  backgroundColor: '#118ab2',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload,
    create,
    update,
    hitBrick,
    resetBall,
    resetLevel,
    hitPaddle,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: false,
    },
  },
};

// Create the game instance
const game = new Phaser.Game(config);
// 预加载资源
function preload() {
  this.load.atlas("assets", "assets/breakout.png", "assets/breakout.json");
}
// 生成界面
function create() {
  //  Enable world bounds, but disable the floor
  this.physics.world.setBoundsCollision(true, true, true, false);

  //  Create the bricks in a 10x6 grid
  bricks = this.physics.add.staticGroup({
    key: "assets",
    frame: ["blue1", "red1", "green1", "yellow1", "silver1", "purple1"],
    frameQuantity: 10,
    gridAlign: {
      width: 10,
      height: 6,
      cellWidth: 64,
      cellHeight: 32,
      x: 112,
      y: 100,
    },
  });

  ball = this.physics.add
    .image(400, 500, "assets", "ball1")
    .setCollideWorldBounds(true)
    .setBounce(1);
  ball.setData("onPaddle", true);

  paddle = this.physics.add.image(400, 550, "assets", "paddle1").setImmovable();

  //  Our colliders
  this.physics.add.collider(ball, bricks, hitBrick, null, this);
  this.physics.add.collider(ball, paddle, hitPaddle, null, this);

  //  Input events
  this.input.on(
    "pointermove",
    function (pointer) {
      //  Keep the paddle within the game
      paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);

      if (ball.getData("onPaddle")) {
        ball.x = paddle.x;
      }
    },
    this
  );

  this.input.on(
    "pointerup",
    function (pointer) {
      if (ball.getData("onPaddle")) {
        ball.setVelocity(-75, -300);
        ball.setData("onPaddle", false);
      }
    },
    this
  );
}

function hitBrick(ball, brick) {
  brick.disableBody(true, true);

  if (bricks.countActive() === 0) {
    resetLevel();
  }
}

function resetBall() {
  ball.setVelocity(0);
  ball.setPosition(paddle.x, 500);
  ball.setData("onPaddle", true);
}
function resetLevel() {
  resetBall();

  bricks.children.each((brick) => {
    brick.enableBody(false, 0, 0, true, true);
  });
}

function hitPaddle(ball, paddle) {
  let diff = 0;

  if (ball.x < paddle.x) {
    //  Ball is on the left-hand side of the paddle
    diff = paddle.x - ball.x;
    ball.setVelocityX(-10 * diff);
  } else if (ball.x > paddle.x) {
    //  Ball is on the right-hand side of the paddle
    diff = ball.x - paddle.x;
    ball.setVelocityX(10 * diff);
  } else {
    //  Ball is perfectly in the middle
    //  Add a little random X to stop it bouncing straight up!
    ball.setVelocityX(2 + Math.random() * 8);
  }
}

function update() {
  if (ball.y > 600) {
    resetBall();
  }
}
