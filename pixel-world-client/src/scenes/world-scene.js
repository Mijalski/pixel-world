import tilesPng from './../assets/tiles.png';
import palettePng from './../assets/palette-gray.png';
import colorPickerPng from './../assets/color-picker.png';
import Phaser from 'phaser';
import * as signalR from '@microsoft/signalr';

const colorsToPick = [0xff0000,0x0000ff,0x00ff00,0xff00ff,0xffff00,0x00ffff,0xffffff,0x000000];

export default class WorldScene extends Phaser.Scene
{

    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('tiles', tilesPng);
        this.load.image('palette', palettePng);
        this.load.image('color-picker', colorPickerPng);
    }
      
    create ()
    {
        this.cameras.main.backgroundColor.setTo(128,128,128); 
        this.colorPicked = colorsToPick[0];

        this.map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 256, height: 256});
        let tiles = this.map.addTilesetImage('tiles');
        let layer = this.map.createBlankLayer('layer1', tiles);
        layer.fill(0,0,0,1920,1080);

        this.marker = this.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);

        this.palette = this.add.image(this.cameras.main.width/2, this.cameras.main.height-40, 'palette')
            .setScrollFactor(0,0)
            .setInteractive();

        this.colorPicker = [];
        for(let i = 0; i < colorsToPick.length; i++) {

            this.colorPicker[i] = this.add.image(this.palette.x - this.palette.width/2 + ((i+1)*98), 
                this.cameras.main.height-50, 'color-picker')
            .setScrollFactor(0,0)
            .setInteractive();
            this.colorPicker[i].tint = colorsToPick[i];

            this.colorPicker[i].on('pointerdown', pointer => {    
                this.colorPicked = colorsToPick[i];
            });
        }

        // signalR
        this.signalrConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:44382/game')
            .build();

        this.signalrConnection.on('MapSize', data => {
            console.log(data);
        });

        this.signalrConnection.on('Map', data => {
            console.log(data);
        });

        this.signalrConnection.start()
            .then(() => this.signalrConnection.invoke('GetMapAsync'));

        console.log('z')
    }

    update(time, delta) 
    {
        let worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

        // Rounds down to nearest tile
        var pointerTileX = this.map.worldToTileX(worldPoint.x);
        var pointerTileY = this.map.worldToTileY(worldPoint.y);

        // Snap to tile coordinates, but in world space
        this.marker.x = this.map.tileToWorldX(pointerTileX);
        this.marker.y = this.map.tileToWorldY(pointerTileY);

        if (this.input.manager.activePointer.leftButtonDown())
        {
            let selectedTile = this.map.getTileAt(pointerTileX, pointerTileY);
            if (selectedTile !== null) {
                selectedTile.tint = this.colorPicked;
            }
        }

        if (this.game.input.activePointer.rightButtonDown()) {
            if (this.game.origDragPoint) {
              this.cameras.main.scrollX +=
                this.game.origDragPoint.x - this.game.input.activePointer.position.x;
              this.cameras.main.scrollY +=
                this.game.origDragPoint.y - this.game.input.activePointer.position.y;
            }
            this.game.origDragPoint = this.game.input.activePointer.position.clone();
        } else {
            this.game.origDragPoint = null;
        }
    }

    changeColor() {

    }
}