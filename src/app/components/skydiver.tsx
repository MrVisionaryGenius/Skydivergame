"use client";

import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function SkyDiverDash() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: "game-container",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 100 },
            debug: false,
          },
        },
        scene: {
          preload: preload,
          create: create,
          update: update,
        },
      };

      gameRef.current = new Phaser.Game(config);

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
        }
      };
    }
  }, []);

  // Define the types of Phaser elements
  let diver: Phaser.Physics.Arcade.Sprite;
  let obstacles: Phaser.Physics.Arcade.Group;
  let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  let score = 0;
  let scoreText: Phaser.GameObjects.Text;

  // Preload assets
  function preload(this: Phaser.Scene) {
    this.load.image("sky", "/sky.png");
    this.load.image("diver", "/diver.png");
    this.load.image("obstacle", "/obstacle.png");
  }

  // Create game objects and logic
  function create(this: Phaser.Scene) {
    // Set the background and scale it to fit the screen size
    const sky = this.add.image(0, 0, "sky").setOrigin(0, 0);
    sky.displayWidth = this.sys.game.config.width as number;
    sky.displayHeight = this.sys.game.config.height as number;

    // Add the diver
    diver = this.physics.add.sprite(100, 300, "diver");
    diver.setBounce(0.2);
    diver.setCollideWorldBounds(true);

    // Create obstacles group
    obstacles = this.physics.add.group();
    cursors = this.input.keyboard.createCursorKeys();

    // Display score
    scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      color: "#000",
    });

    // Add collision between diver and obstacles
    this.physics.add.collider(diver, obstacles, hitObstacle, null, this);

    // Create obstacles every 1.5 seconds
    this.time.addEvent({
      delay: 1500,
      callback: createObstacle,
      callbackScope: this,
      loop: true,
    });

    // Listen for spacebar to restart after game over
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.restart();
    });
  }

  // Update game logic
  function update(this: Phaser.Scene, time: number, delta: number) {
    if (cursors.left?.isDown) {
      diver.setVelocityX(-160);
    } else if (cursors.right?.isDown) {
      diver.setVelocityX(160);
    } else {
      diver.setVelocityX(0);
    }

    if (cursors.up?.isDown && diver.body.touching.down) {
      diver.setVelocityY(-200);
    }

    // Update the score based on time elapsed
    score += delta / 1000;
    scoreText.setText("Score: " + Math.floor(score));
  }

  // Create new obstacles
  function createObstacle(this: Phaser.Scene) {
    const x = Phaser.Math.Between(0, 800);
    const obstacle = obstacles.create(
      x,
      0,
      "obstacle"
    ) as Phaser.Physics.Arcade.Sprite;
    obstacle.setBounce(1);
    obstacle.setCollideWorldBounds(true);
    obstacle.setVelocity(Phaser.Math.Between(-200, 200), 100);
  }

  // Handle collision between diver and obstacles
  function hitObstacle(this: Phaser.Scene) {
    if (!diver) return;
    this.physics.pause();
    diver.setTint(0xff0000);

    this.add
      .text(400, 300, "Game Over - Press SPACE to Restart", {
        fontSize: "32px",
        color: "#000",
      })
      .setOrigin(0.5);

    // Add game restart on pointer click or key press
    this.input.once("pointerdown", () => {
      this.scene.restart();
    });
    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.restart();
    });
  }

  return <div id="game-container" className="w-full h-full" />;
}
