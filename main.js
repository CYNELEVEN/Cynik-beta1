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

    this.add.text(16, 46, "If you can see this, it runs.", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#cbd5e1"
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#0f1a2b",
  scene: [PlayScene],
  pixelArt: true
});
