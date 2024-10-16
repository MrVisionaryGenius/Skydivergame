"use client";
import React, { useEffect, useRef } from "react";
import * as Phaser from "phaser";

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
            gravity: { x: 0, y: 100 }, // Fixed: added x property
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

  let diver: Phaser.Physics.Arcade.Sprite;
  let obstacles: Phaser.Physics.Arcade.Group;
  let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  let score = 0;
  let scoreText: Phaser.GameObjects.Text;

  // Add type annotation for 'this' (Phaser.Scene)
  function preload(this: Phaser.Scene) {
    this.load.image("sky", "/sky.png");
    this.load.image("diver", "/diver.png");
    this.load.image("obstacle", "/obstacle.png");
  }

  // Add type annotation for 'this' (Phaser.Scene)
  function create(this: Phaser.Scene) {
    // Make the background cover the entire screen
    const sky = this.add.image(0, 0, "sky");
    sky.setOrigin(0, 0);
    sky.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);

    diver = this.physics.add.sprite(100, 300, "diver");
    diver.setBounce(0.2);
    diver.setCollideWorldBounds(true);

    obstacles = this.physics.add.group();
    // cursors = this.input.keyboard.createCursorKeys();
    cursors = this.input.keyboard!.createCursorKeys();

    scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      color: "#000",
    });

    // Correct types for the collider callback
    this.physics.add.collider(
      diver,
      obstacles,
      hitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.time.addEvent({
      delay: 1500,
      callback: createObstacle,
      callbackScope: this,
      loop: true,
    });
  }

  // Add type annotation for 'this' (Phaser.Scene)
  function update(this: Phaser.Scene, time: number, delta: number) {
    if (cursors.left?.isDown) {
      diver.setVelocityX(-160);
    } else if (cursors.right?.isDown) {
      diver.setVelocityX(160);
    } else {
      diver.setVelocityX(0);
    }

    // Check if diver.body exists before accessing
    if (diver.body && cursors.up?.isDown && diver.body.touching.down) {
      diver.setVelocityY(-200);
    }

    score += delta / 1000;
    scoreText.setText("Score: " + Math.floor(score));
  }

  // Add type annotation for 'this' (Phaser.Scene)
  function createObstacle(this: Phaser.Scene) {
    const x = Phaser.Math.Between(0, 800);
    const obstacle = obstacles.create(
      x,
      0,
      "obstacle"
    ) as Phaser.Physics.Arcade.Sprite;
    obstacle.setBounce(1);
    obstacle.setCollideWorldBounds(true);

    const xVelocity = Phaser.Math.Between(-200, 200);
    const yVelocity = 100; // or any other value as needed
    obstacle.setVelocity(xVelocity, yVelocity);
  }

  // Fix type mismatch by specifying correct types
  function hitObstacle(
    diver: Phaser.Physics.Arcade.Sprite, // diver must be an Arcade Sprite
    obstacle: Phaser.Physics.Arcade.Sprite // obstacle must also be an Arcade Sprite
  ) {
    diver.setTint(0xff0000);
    diver.scene.physics.pause();

    diver.scene.add
      .text(400, 300, "Game Over", { fontSize: "64px", color: "#000" })
      .setOrigin(0.5);

    // Optionally refresh the game after a few seconds
    diver.scene.time.delayedCall(2000, () => {
      window.location.reload();
    });
  }

  return <div id="game-container" className="w-full h-full" />;
}
