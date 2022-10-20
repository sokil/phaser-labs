class GameOverScene extends Phaser.Scene {
    constructor() {
        super("gameOver");
    }

    create() {
        this.add.text(20, 20, "Game Over", {fill: "red"});
    }
}
