class PlayScene extends Phaser.Scene {
    constructor() {
        super("play");
    }

    preload() {
        this.load.image("background", "assets/bg_tile.jpg");

        this.load.spritesheet("asteroid", "assets/asteroid.png", {
            frameWidth: 35,
            frameHeight: 30,
        });

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
            frameRate: 15,
            repeat: 0,
            hideOnComplete: true
        })

        this.asteroids = [];
        for (var i = 0; i < 6; i++) {
            this.asteroids[i] = this.add.sprite(
                Phaser.Math.Between(0, config.width),
                Phaser.Math.Between(-500, -10),
                "asteroid"
            );
            this.asteroids[i].setInteractive();
            this.asteroids[i].setOrigin(0, 0);
            this.asteroids[i].setScale(Phaser.Math.Between(1, 1.5));
            this.startAngleBounce(this.asteroids[i]);
        }

        this.input.on('gameobjectdown', this.destroyAsteroid, this);

        this.add.text(20, 20, "Score: 0", {fill: "red"});
    }

    update() {
        for (var i in this.asteroids) {
            this.moveAsteroid(this.asteroids[i], 1);
        }

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

    destroyAsteroid(pointer, gameObject) {
        console.log(gameObject)
        gameObject.setTexture("explosion");
        gameObject.play("explosion_anim");
    }

    moveAsteroid(asteroid, velocity) {
        asteroid.y += velocity;
        if (asteroid.y > config.height) {
            this.resetAsteroid(asteroid);
        }
    }

    resetAsteroid(asteroid) {
        asteroid.x = Phaser.Math.Between(0, config.width);
        asteroid.y = -50;
        asteroid.setTexture("asteroid");
        asteroid.setVisible(true);
    }
}
