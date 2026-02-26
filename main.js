// CYNIK — Quiet Chamber Baseline (NO audio yet)
// VERSION: QC-BASE-1

const WIDTH = 640;
const HEIGHT = 640;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

class PlayScene extends Phaser.Scene {
  constructor() { super("Play"); }

  create() {
    // Score
    this.score = 0;

    // UI (minimal)
    this.add.text(16, 16, "CYNIK", {
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

    // Touch movement (tablet)
    this.target = { x: WIDTH / 2, y: HEIGHT / 2 };
    this.speedBase = 260;
    this.speed = this.speedBase;

    this.input.on("pointerdown", (p) => this.setTarget(p));
    this.input.on("pointermove", (p) => { if (p.isDown) this.setTarget(p); });

    // Apples
    this.apples = this.physics.add.group();
    this.spawnApple();

    this.physics.add.overlap(this.player, this.apples, (player, apple) => {
      apple.destroy();
      this.score++;
      this.scoreText.setText("Apples: " + this.score);
      this.spawnApple();
    });

    // Hog (CYNIK)
    this.hog = this.add.rectangle(-100, -100, 22, 22, 0xff4d4d);
    this.physics.add.existing(this.hog);
    this.hog.body.setVelocity(0, 0);

    // Subtle friction tint (quiet)
    this.chargeTint = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xff0000, 0.0);
    this.chargeTint.setDepth(900);

    // Reset overlay (quiet)
    this.isReset = false;
    this.invulnerable = false;

    this.overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.0);
    this.overlay.setDepth(1000);

    this.breathCircle = this.add.circle(WIDTH / 2, HEIGHT / 2, 10, 0x66e0ff, 0.0);
    this.breathCircle.setDepth(1001);

    this.resetText = this.add.text(WIDTH / 2, HEIGHT / 2 - 40, "RESET", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ffffff"
    }).setOrigin(0.5).setAlpha(0).setDepth(1001);

    this.steadyFlash = this.add.text(WIDTH / 2, HEIGHT - 60, "Stay Steady", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#66e0ff"
    }).setOrigin(0.5).setAlpha(0).setDepth(1001);

    // Hog hit → Reset
    this.physics.add.overlap(this.player, this.hog, () => {
      if (!this.isReset && !this.invulnerable) this.triggerReset();
    });

    // Charges
    this.chargeActive = false;
    this.scheduleNextCharge();
  }

  setTarget(pointer) {
    this.target.x = Phaser.Math.Clamp(pointer.x, 0, WIDTH);
    this.target.y = Phaser.Math.Clamp(pointer.y, 0, HEIGHT);
  }

  spawnApple() {
    const x = Phaser.Math.Between(40, WIDTH - 40);
    const y = Phaser.Math.Between(90, HEIGHT - 40);

    const apple = this.add.rectangle(x, y, 14, 14, 0xffd166);
    this.physics.add.existing(apple);
    apple.body.setImmovable(true);

    this.apples.add(apple);
  }

  scheduleNextCharge() {
    const delay = randInt(8000, 12000);
    this.time.delayedCall(delay, () => this.startCharge());
  }

  startCharge() {
  if (this.chargeActive || this.isReset) return;
  this.chargeActive = true;

  // Quiet friction: subtle tint + slight speed lift
  this.chargeTint.setFillStyle(0xff0000, 0.10);
  this.speed = this.speedBase + 40;

  // TEST MODE: always charge through the center line
  const hogSpeed = 420;

  // Start left, go right through middle
  const x = -30;
  const y = HEIGHT / 2;

  this.hog.setPosition(x, y);
  this.hog.body.setVelocity(hogSpeed, 0);

  // End after 1.6s
  this.time.delayedCall(1600, () => this.endCharge());
}
    this.hog.setPosition(x, y);
    this.hog.body.setVelocity(vx, vy);

    this.time.delayedCall(1600, () => this.endCharge());
  }

  endCharge() {
    this.chargeActive = false;
    this.hog.body.setVelocity(0, 0);
    this.hog.setPosition(-100, -100);

    this.chargeTint.setFillStyle(0xff0000, 0.0);
    this.speed = this.speedBase;

    if (!this.isReset) this.scheduleNextCharge();
  }

  triggerReset() {
    this.isReset = true;

    // Stop movement
    this.player.body.setVelocity(0, 0);
    this.hog.body.setVelocity(0, 0);
    this.hog.setPosition(-100, -100);

    // Clear friction visuals
    this.chargeTint.setFillStyle(0xff0000, 0.0);
    this.speed = this.speedBase;

    // Show reset layer
    this.overlay.setFillStyle(0x000000, 0.45);
    this.resetText.setAlpha(1);
    this.breathCircle.setAlpha(0.9);
    this.breathCircle.setRadius(10);

    // Physiological sigh (2 short in, 1 long out)
    this.tweens.timeline({
      targets: this.breathCircle,
      tweens: [
        { radius: 36, duration: 600, ease: "Sine.easeOut" },
        { radius: 48, duration: 600, ease: "Sine.easeOut" },
        { radius: 12, duration: 1600, ease: "Sine.easeInOut" }
      ]
    });

    // Auto-end safety (max 10s)
    this.time.delayedCall(10000, () => {
      if (this.isReset) this.endReset();
    });

    // End early on touch (choice)
    this.input.once("pointerdown", () => {
      if (this.isReset) this.endReset();
    });
  }

  endReset() {
    this.isReset = false;

    // Hide reset visuals
    this.overlay.setFillStyle(0x000000, 0.0);
    this.resetText.setAlpha(0);
    this.breathCircle.setAlpha(0);

    // Flash “Stay Steady”
    this.steadyFlash.setAlpha(1);
    this.tweens.add({
      targets: this.steadyFlash,
      alpha: 0,
      duration: 800,
      ease: "Sine.easeOut"
    });

    // Brief grace period (avoid instant re-hit)
    this.invulnerable = true;
    this.time.delayedCall(2000, () => { this.invulnerable = false; });

    // Resume charge schedule
    this.scheduleNextCharge();
  }

  update() {
    if (this.isReset) return;

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
