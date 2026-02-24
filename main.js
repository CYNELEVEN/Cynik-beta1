const WIDTH = 640;
const HEIGHT = 640;

class PlayScene extends Phaser.Scene {
  constructor() { super("Play"); }

  create() {
    this.add.text(16, 16, "CYNIK Beta 1", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff"
    });

    this.add.text(16, 44, "Drag anywhere to move", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#cbd5e1"
    });

    // Player (8-bit block)
    this.player = this.add.rectangle(WIDTH / 2, HEIGHT / 2, 20, 20, 0x7aa7ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Touch target point (defaults to player start)
    this.target = { x: WIDTH / 2, y: HEIGHT / 2 };

    // Tablet touch: drag sets target
    this.input.on("pointerdown", (p) => this.setTarget(p));
    this.input.on("pointermove", (p) => {
      if (p.isDown) this.setTarget(p);
    });

    this.speed = 260;
  }

  setTarget(pointer) {
    // Clamp inside screen bounds
    this.target.x = Phaser.Math.Clamp(pointer.x, 0, WIDTH);
    this.target.y = Phaser.Math.Clamp(pointer.y, 0, HEIGHT);
  }

  update() {
    const body = this.player.body;

    // Move toward target
    const dx = this.target.x - this.player.x;
    const dy = this.target.y - this.player.y;

    const dist = Math.hypot(dx, dy);

    // Stop if very close
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
