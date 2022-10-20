class PlayScene extends Phaser.Scene {
    constructor() {
        super("play");
    }

    preload() {
        this.load.image("background", "assets/bg_tile.jpg");
        this.load.image("spaceship", "assets/spaceship.png");
        this.load.image("asteroid", "assets/asteroid.png");
    }

    create() {
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        console.log(window.config)
        this.ship = this.add.image(config.width/2, config.height/2, "spaceship");
        this.ship.setOrigin(0, 0);

        this.startScaleBounce(this.ship);
        this.startAngleBounce(this.ship);

        this.asteroid1 = this.add.image(
            Phaser.Math.Between(0, config.width),
            -50,
            "asteroid"
        );
        this.asteroid1.setOrigin(0, 0);

        this.startAngleBounce(this.asteroid1);

        this.asteroid2 = this.add.image(
            Phaser.Math.Between(0, config.width),
            -50,
            "asteroid"
        );
        this.asteroid2.setOrigin(0, 0);

        this.startAngleBounce(this.asteroid2);

        this.add.text(20, 20, "Score: 0", {fill: "red"});
    }

    update() {
        this.moveAsteroid(this.asteroid1, 1);
        this.moveAsteroid(this.asteroid2, 2);
    }

    startScaleBounce(object) {
        var scaleStep = 0.01;
        setInterval(() => {
            if (object.scale > 1.1) {
                scaleStep = -0.01;
            } else if (object.scale < 0.9) {
                scaleStep = 0.01;
            }

            object.scale += scaleStep;
        }, 100);
    }

    startAngleBounce(object) {
        var angleStep = 1;
        setInterval(() => {
            if (object.angle > 4) {
                angleStep = -1;
            } else if (this.ship.angle < -4) {
                angleStep = 1;
            }

            object.angle += angleStep;
        }, 100);
    }

    moveAsteroid(asteroid, velocity) {
        asteroid.y += velocity;
        if (asteroid.y > config.height) {
            this.resetAsteroid(asteroid);
        }
    }

    resetAsteroid(asteroid) {
        asteroid.x = Phaser.Math.Between(0, config.width)
        asteroid.y = -50
    }
}
