import WorldScene from './scenes/world-scene.js';

import Phaser from 'phaser';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-game',
    width: window.innerWidth,
    height: window.innerHeight+5,
    scene: WorldScene
};

const game = new Phaser.Game(config);
