// VERSION: 6  (Apples + Hog Charge + Steady Mode)

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

  create(// RESET text
this.resetText = this.add.text(WIDTH / 2, HEIGHT / 2 - 40, "RESET", {
  fontFamily: "monospace",
  fontSize: "22px",
  color: "#ffffff"
}).setOrigin(0.5).setAlpha(0).setDepth(1001);

// Stay Steady flash text
this.steadyFlash = this.add.text(WIDTH / 2, HEIGHT - 60, "Stay Steady", {
  fontFamily: "monospace",
  fontSize: "18px",
  color: "#66e0ff"
}).setOrigin(0.5).setAlpha(0).setDepth(1001);

this.invulnerable = false;) {
    this.score = 0;

    // UI
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

    this.msgText = this.add.text(16, 64, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#cbd5e1"
    });

    // Player
    this.player = this.add.rectangle(WIDTH / 2, HEIGHT / 2, 20, 20, 0x7aa7ff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Touch controls (tablet)
    this.target = { x: WIDTH / 2, y: HEIGHT / 2 };
    this.speed = 260;

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

    // Charge tint overlay
    this.chargeTint = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xff0000, 0.0);
    this.chargeTint.setDepth(900);

    // Steady Mode overlay + breath circle
    this.isSteadyMode = false;

    this.overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.0);
    this.overlay.setDepth(1000);

    this.breathCircle = this.add.circle(WIDTH / 2, HEIGHT / 2, 10, 0x66e0ff, 0.0);
    this.breathCircle.setDepth(1001);

    this.steadyText = this.add.text(WIDTH / 2, HEIGHT / 2 + 60, "Stay Steady", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff"
    }).setOrigin(0.5);
    this.steadyText.setAlpha(0);
    this.steadyText.setDepth(1001);

    // this.physics.add.overlap(this.player, this.hog, () => {
  if (!this.isSteadyMode && !this.invulnerable) {
    this.triggerSteadyMode();
  }
});
      }
    });

    // Schedule charges
    this.chargeActive = false;
    this.scheduleNextCharge();
  }

  spawnApple() {
    const x = Phaser.Math.Between(40, WIDTH - 40);
    const y = Phaser.Math.Between(90, HEIGHT - 40);

    const apple = this.add.rectangle(x, y, 14, 14, 0xffd166);
    this.physics.add.existing(apple);
    apple.body.setImmovable(true);

    this.apples.add(apple);
  }

  setTarget(pointer) {
    this.target.x = Phaser.Math.Clamp(pointer.x, 0, WIDTH);
    this.target.y = Phaser.Math.Clamp(pointer.y, 0, HEIGHT);
  }

  scheduleNextCharge() {
    const delay = randInt(8000, 12000);
    this.time.delayedCall(delay, () => this.startCharge());
  }

  startCharge() {
    if (this.chargeActive || this.isSteadyMode) return;
    this.chargeActive = true;

    // Visual + pressure
    this.chargeTint.setFillStyle(0xff0000, 0.12);
    this.msgText.setText("CYNIK IS CHARGING");
    this.speed = 300; // slight speed increase

    // Choose entry side
    const side = choice(["left", "right", "top", "bottom"]);
    const hogSpeed = 420;

    let x, y, vx, vy;
    if (side === "left") {
      x = -30; y = Phaser.Math.Between(80, HEIGHT - 40);
      vx = hogSpeed; vy = 0;
    } else if (side === "right") {
      x = WIDTH + 30; y = Phaser.Math.Between(80, HEIGHT - 40);
      vx = -hogSpeed; vy = 0;
    } else if (side === "top") {
      x = Phaser.Math.Between(40, WIDTH - 40); y = -30;
      vx = 0; vy = hogSpeed;
    } else {
      x = Phaser.Math.Between(40, WIDTH - 40); y = HEIGHT + 30;
      vx = 0; vy = -hogSpeed;
    }

    this.hog.setPosition(x, y);
    this.hog.body.setVelocity(vx, vy);

    // End after 1.6s
    this.time.delayedCall(1600, () => this.endCharge());
  }

  endCharge() {
    this.chargeActive = false;
    this.hog.body.setVelocity(0, 0);
    this.hog.setPosition(-100, -100);

    this.chargeTint.setFillStyle(0xff0000, 0.0);
    if (!this.isSteadyMode) this.msgText.setText("");
    this.speed = 260; // back to normal
    this.scheduleNextCharge();
  }

  triggerSteadyMode() {
  if (this.isSteadyMode) return;

  this.isSteadyMode = true;

  // Stop movement immediately
  this.player.body.setVelocity(0, 0);
  this.hog.body.setVelocity(0, 0);

  this.chargeTint.setFillStyle(0xff0000, 0.0);

  // Show overlay + RESET text
  this.overlay.setFillStyle(0x000000, 0.45);
  this.resetText.setAlpha(1);

  this.breathCircle.setAlpha(0.9);
  this.breathCircle.setRadius(10);

  // Physiological sigh animation
  this.tweens.timeline({
    targets: this.breathCircle,
    tweens: [
      { radius: 36, duration: 600, ease: "Sine.easeOut" },   // inhale 1
      { radius: 48, duration: 600, ease: "Sine.easeOut" },   // inhale 2
      { radius: 12, duration: 1600, ease: "Sine.easeInOut" } // long exhale
    ],
    onComplete: () => {
      // Remain in reset until movement OR 10s max
    }
  });

  // Auto-end after 10 seconds max
  this.time.delayedCall(10000, () => {
    if (this.isSteadyMode) this.endSteadyMode();
  });

  // End early if player touches
  this.input.once("pointerdown", () => {
    if (this.isSteadyMode) this.endSteadyMode();
  });
}
  });

  // Auto-end after 10 seconds max
  this.time.delayedCall(10000, () => {
    if (this.isSteadyMode) this.endSteadyMode();
  });

  // End early if player touches
  this.input.once("pointerdown", () => {
    if (this.isSteadyMode) this.endSteadyMode();
  });
}
  
  endSteadyMode() {
  this.isSteadyMode = false;

  // Hide reset visuals
  this.overlay.setFillStyle(0x000000, 0.0);
  this.resetText.setAlpha(0);
  this.breathCircle.setAlpha(0);

  // Flash Stay Steady
  this.steadyFlash.setAlpha(1);
  this.tweens.add({
    targets: this.steadyFlash,
    alpha: 0,
    duration: 800,
    ease: "Sine.easeOut"
  });

  // 2-second invulnerability window
  this.invulnerable = true;
  this.time.delayedCall(2000, () => {
    this.invulnerable = false;
  });
}

  update() {
    if (this.isSteadyMode) return;

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
