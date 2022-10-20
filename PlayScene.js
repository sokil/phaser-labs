class PlayScene extends Phaser.Scene
{
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

        this.load.spritesheet("power-up", "assets/spritesheet/power-up.png", {
            frameWidth: 16,
            frameHeight: 16,
        });

        this.load.spritesheet("beam", "assets/spritesheet/beam.png",{
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        // background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        // ship
        this.player = this.physics.add.sprite(config.width/2, config.height - 60, "spaceship");
        this.startScaleBounce(this.player);
        this.startAngleBounce(this.player);
        this.anims.create({
            key: "spaceship_anim",
            frames: this.anims.generateFrameNumbers("spaceship"),
            frameRate: 25,
            repeat: -1
        });
        this.player.play("spaceship_anim");
        this.player.setCollideWorldBounds(true);

        // beam
        this.anims.create({
            key: "beam_anim",
            frames: this.anims.generateFrameNumbers("beam"),
            frameRate: 20,
            repeat: -1
        });

        // asteroid explosion
        this.anims.create({
            key: "explosion_anim",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 15,
            repeat: 0,
            hideOnComplete: true
        });

        // asteroids
        this.asteroids = [];
        for (var i = 0; i < 7; i++) {
            var asteroid = this.add.sprite(
                Phaser.Math.Between(100, config.width - 100),
                Phaser.Math.Between(-600, -10),
                "asteroid"
            );
            asteroid.setInteractive();
            asteroid.setOrigin(0, 0);
            asteroid.setAngle(Phaser.Math.Between(0, 360));
            asteroid.setScale(Phaser.Math.Between(1, 1.5));
            this.startAngleBounce(asteroid);

            this.asteroids[i] = asteroid;
        }

        // power ups
        this.anims.create({
            key: "red_powerup_anim",
            frames: this.anims.generateFrameNumbers("power-up", {start: 0, end: 1}),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: "gray_powerup_anim",
            frames: this.anims.generateFrameNumbers("power-up", {start: 2, end: 3}),
            frameRate: 20,
            repeat: -1
        });

        this.powerUps = this.physics.add.group();
        for (var j = 0 ; j < 2; j++) {
            var powerUp = this.physics.add.sprite(16, 16, "power-up");
            this.powerUps.add(powerUp);
            powerUp.setRandomPosition(0, 0, config.width, config.height/2);
            powerUp.setCollideWorldBounds(true);
            powerUp.setBounce(1);
            powerUp.setVelocity(100, 100);
            powerUp.play("red_powerup_anim")
        }

        // projectiles
        this.projectiles = this.add.group();

        // destroy power ups by beam
        this.physics.add.collider(
            this.projectiles,
            this.powerUps,
            function (projectile, powerUp) {
                projectile.destroy();
                powerUp.destroy();
            }
        );

        // pickup power ups by user
        this.pickedPowerUps = [];
        this.physics.add.overlap(
            this.player,
            this.powerUps,
            this.pickPowerUp,
            null,
            this
        );

        // handle explosion on interactive objects
        this.input.on('gameobjectdown', this.destroyAsteroid, this);

        // handle keyboard
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        // shoot
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // score
        this.add.text(20, 20, "Score: 0", {fill: "red"});
    }

    update() {
        // move backgroung
        this.background.tilePositionY -= 0.5

        // move asteroids
        for (var i in this.asteroids) {
            this.moveAsteroid(this.asteroids[i], 1);
        }

        // player moves
        this.movePlayer();

        // handle shoot
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            this.shootBeam();
        }

        // update beams
        for(var i = 0; i < this.projectiles.getChildren().length; i++) {
            var beam = this.projectiles.getChildren()[i];
            beam.update();
        }
    }

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
    }

    shootBeam() {
        var beam = new Beam(this);
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
            } else if (this.player.angle < -4) {
                angleStep = 1;
            }

            object.angle += angleStep;
        }, 100);
    }

    destroyAsteroid(pointer, gameObject) {
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

    movePlayer() {
        if (this.cursorKeys.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursorKeys.right.isDown) {
            this.player.setVelocityX(200);
        }

        if (this.cursorKeys.up.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursorKeys.down.isDown) {
            this.player.setVelocityY(200);
        }
    }
}
