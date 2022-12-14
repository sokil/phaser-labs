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

        this.load.audio("beam", ["assets/sound/beam.ogg"]);
        this.load.audio("explosion", ["assets/sound/explosion.ogg"]);
        this.load.audio("pickup", ["assets/sound/pickup.ogg"]);
        this.load.audio("bg_sound", ["assets/sound/bg.ogg"]);
    }

    create() {
        // background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
        this.background.setOrigin(0, 0);

        // sounds
        this.beamSound = this.sound.add("beam");
        this.explosionSound = this.sound.add("explosion");
        this.pickupSound = this.sound.add("pickup");
        this.bgSound = this.sound.add("bg_sound");

        // bg sound
        this.bgSound.play();

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
        this.asteroids = this.physics.add.group();
        for (var i = 0; i < 4; i++) {
            var asteroid = this.physics.add.sprite(
                Phaser.Math.Between(100, config.width - 100),
                Phaser.Math.Between(-600, -10),
                "asteroid"
            );
            asteroid.setInteractive();
            asteroid.setOrigin(0, 0);
            asteroid.setAngle(Phaser.Math.Between(0, 40));
            asteroid.setScale(Phaser.Math.Between(1, 1.5));
            this.startAngleBounce(asteroid);

            asteroid.on('animationcomplete', (animation, frame, asteroid, frameKey) => {
                if (animation.key === "explosion_anim") {
                    this.resetAsteroid(asteroid);
                }
            });

            this.asteroids.add(asteroid);
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

        // destroy power ups by projectile
        this.physics.add.collider(
            this.projectiles,
            this.powerUps,
            function (projectile, powerUp) {
                projectile.destroy();
                powerUp.destroy();
            }
        );

        // pickup power ups by user
        this.physics.add.overlap(
            this.player,
            this.powerUps,
            this.pickPowerUp,
            null,
            this
        );

        // destroy ship by asteroid
        this.physics.add.overlap(
            this.player,
            this.asteroids,
            this.destroyPlayerByAsteroid,
            null,
            this
        );

        // destroy asteroids by beam
        this.physics.add.overlap(
            this.projectiles,
            this.asteroids,
            this.destroyAsteroidByProjectile,
            null,
            this
        );

        // handle explosion on interactive objects
        this.input.on('gameobjectdown', this.destroyAsteroidByMouseClick, this);

        // handle keyboard
        this.cursorKeys = this.input.keyboard.createCursorKeys();

        // shoot
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // score
        this.add.text(20, 20, "Score: ", {fill: "red"});
        this.score = this.add.text(80, 20, "0", {fill: "red"});
    }

    update() {
        // move backgroung
        this.background.tilePositionY -= 0.5

        // move asteroids
        for (var i in this.asteroids.getChildren()) {
            this.moveAsteroid(this.asteroids.getChildren()[i], 1);
        }

        // player moves
        this.movePlayer();

        // handle shoot
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            if (this.player.active) {
                this.shootBeam();
            }
        }

        // update beams
        for(var i = 0; i < this.projectiles.getChildren().length; i++) {
            var beam = this.projectiles.getChildren()[i];
            beam.update();
        }
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

    destroyAsteroidByMouseClick(pointer, asteroid) {
        this.destroyAsteroid(asteroid);
        this.explosionSound.play();
    }

    destroyAsteroidByProjectile(projectile, asteroid) {
        projectile.destroy()
        this.destroyAsteroid(asteroid)
        this.score.setText(parseInt(this.score.text) + 1);
        this.explosionSound.play();
    }

    destroyAsteroid(asteroid) {
        asteroid.disableBody(true, true);
        var explosion = new Explosion(this, asteroid.x, asteroid.y);

        this.time.addEvent({
            delay: 1000,
            callback: () => this.resetAsteroid(asteroid),
            callbackScope: this,
            loop: false
        })
    }

    moveAsteroid(asteroid, velocity) {
        asteroid.y += velocity;
        if (asteroid.y > config.height) {
            this.resetAsteroid(asteroid);
        }
    }

    resetAsteroid(asteroid) {
        var x = Phaser.Math.Between(0, config.width);
        var y = -50;
        asteroid.enableBody(true, x, y, true, true);
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

    pickPowerUp(player, powerUp) {
        powerUp.disableBody(true, true);
        this.pickupSound.play();
    }

    shootBeam() {
        var beam = new Beam(this);
        this.beamSound.play();
    }

    destroyPlayer(player) {
        if (this.player.alpha < 1) {
            return;
        }

        player.active = false;
        player.setVelocity(0, 0);
        player.disableBody(true, true);

        var explosion = new Explosion(this, player.x, player.y);

        this.time.addEvent({
            delay: 1000,
            callback: () => this.resetPlayer(player),
            callbackScope: this,
            loop: false
        });
    }

    resetPlayer (player) {
        player.active = true;
        var x = config.width/2;
        var y = config.height - 100;
        player.enableBody(true, x, y, true, true);
        player.setVelocity(0, 0);
        player.alpha = 0.5;

        var tween = this.tweens.add({
            targets: player,
            y: config.height - 100,
            ease: 'Power1',
            duration: 1500,
            repeat: 0,
            onComplete: function() {
                player.alpha = 1;
            },
            callbackScope: this
        });
    }

    destroyPlayerByAsteroid(player, asteroid) {
        this.destroyAsteroid(asteroid);
        this.destroyPlayer(player);
        this.explosionSound.play();
    }
}
