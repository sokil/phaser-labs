class WellcomeScene extends Phaser.Scene {
    constructor() {
        super("wellcome");
    }

    create() {
        this.add.text(20, 20, "Loading game...");
        this.scene.start("play");
    }
}
