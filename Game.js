window.onload = function () {
    console.log(1)
    window.config = {
        width: 640,
        height: 640,
        backgroundColor: 0x000000,
        scene: [WellcomeScene, PlayScene],
        pixelArt: true
    };

    var game = new Phaser.Game(config);
}
