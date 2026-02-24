// VERSION: 5

const WIDTH = 640;
const HEIGHT = 640;

class PlayScene extends Phaser.Scene {
  constructor() { super("Play"); }

  create() {

    this.score = 0;

    this.add.text(16, 16, "CYNIK Beta 1", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff"
    });

    this.scoreText = this.add.text(16, 44, "Apples: 0", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#cbd5e1"
    });

    // Player
    this.player = this.add.rectangle(WIDTH / 2, HEIGHT / 2, 20, 20, 0x7aa7ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Apples group
    this.apples = this.physics.add.group();

    this.spawnApple();

    // Touch target
    this.target = { x: WIDTH / 2, y: HEIGHT / 2 };
    this.speed = 260;

    this.input.on("pointerdown", (p) => this.setTarget(p));
    this.input.on("pointermove", (p) => {
      if (p.isDown) this.setTarget(p);
    });

    // Overlap detection
    this.physics.add.overlap(this.player, this.apples, (player, apple) => {
      apple.destroy();
      this.score++;
      this.scoreText.setText("Apples: " + this.score);
      this.spawnApple();
    });
  }

  spawnApple() {
    const x = Phaser.Math.Between(40, WIDTH - 40);
    const y = Phaser.Math.Between(80, HEIGHT - 40);

    const apple = this.add.rectangle(x, y, 14, 14, 0xffd166);
    this.physics.add.existing(apple);
    apple.body.setImmovable(true);

    this.apples.add(apple);
  }

  setTarget(pointer) {
    this.target.x = Phaser.Math.Clamp(pointer.x, 0, WIDTH);
    this.target.y = Phaser.Math.Clamp(pointer.y, 0, HEIGHT);
  }

  update() {
    const body = this.player.body;

    const dx = this.target.x - this.player.x;
    const dy = this.target.y - this.player.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 6) {
      body.setVelocity(0);
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    body.setVelocity(nx * this.speed, ny * this.speed);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#0f1a2b",
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [PlayScene],
  pixelArt: true
});
