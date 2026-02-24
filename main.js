const WIDTH = 640;
const HEIGHT = 640;

class PlayScene extends Phaser.Scene {
  constructor() { super("Play"); }

  create() {

    // Title
    this.add.text(16, 16, "CYNIK Beta 1", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff"
    });

    // Create player (8-bit square)
    this.player = this.add.rectangle(WIDTH / 2, HEIGHT / 2, 20, 20, 0x7aa7ff);

    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.speed = 200;
  }

  update() {
    const body = this.player.body;

    body.setVelocity(0);

    if (this.cursors.left.isDown) {
      body.setVelocityX(-this.speed);
    }
    else if (this.cursors.right.isDown) {
      body.setVelocityX(this.speed);
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-this.speed);
    }
    else if (this.cursors.down.isDown) {
      body.setVelocityY(this.speed);
    }
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#0f1a2b",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [PlayScene],
  pixelArt: true
});
