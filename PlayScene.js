class PlayScene extends Phaser.Scene {
    constructor() {
        super("play");
    }

    preload() {
        this.load.image("background", "assets/bg_tile.jpg");
        this.load.image("asteroid", "assets/asteroid.png");

        this.load.spritesheet("spaceship", "assets/spritesheet/spaceship.png", {
            frameWidth: 81,
            frameHeight: 90,
        })

        this.load.spritesheet("explosion", "assets/spritesheet/explosion.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
    }

    create() {
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        this.ship = this.add.sprite(config.width/2, config.height/2, "spaceship");

        this.startScaleBounce(this.ship);
        this.startAngleBounce(this.ship);

        this.anims.create({
            key: "spaceship_anim",
            frames: this.anims.generateFrameNumbers("spaceship"),
            frameRate: 25,
            repeat: -1
        });

        this.ship.play("spaceship_anim");

        this.anims.create({
            key: "explosion_anim",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        })

        this.asteroid1 = this.add.image(
            Phaser.Math.Between(0, config.width),
            -50,
            "asteroid"
        );
        this.asteroid1.setOrigin(0, 0);
        this.asteroid1.setScale(Phaser.Math.Between(1, 1.5))

        this.startAngleBounce(this.asteroid1);

        this.asteroid2 = this.add.image(
            Phaser.Math.Between(0, config.width),
            -50,
            "asteroid"
        );
        this.asteroid2.setOrigin(0, 0);
        this.asteroid2.setScale(Phaser.Math.Between(1, 1.5))

        this.startAngleBounce(this.asteroid2);

        this.add.text(20, 20, "Score: 0", {fill: "red"});
    }

    update() {
        this.moveAsteroid(this.asteroid1, 1);
        this.moveAsteroid(this.asteroid2, 2);

        this.background.tilePositionY -= 0.5
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
