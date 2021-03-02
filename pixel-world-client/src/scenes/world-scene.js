import tilesPng from './../assets/tiles.png';
import palettePng from './../assets/palette-gray.png';
import colorPickerPng from './../assets/color-picker.png';
import Phaser from 'phaser';
import * as signalR from '@microsoft/signalr';

const colorsToPick = [0xffffff,0x000000,0xff0000,0x0000ff,0x00ff00,0xff00ff,0xffff00,0x00ffff];

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
        this.colorsAtPostionsChanged = [];
        for(let i = 0; i < colorsToPick.length; i++) {

            this.colorPicker[i] = this.add.image(this.palette.x - this.palette.width/2 + ((i+1)*98), 
                this.cameras.main.height-50, 'color-picker')
            .setScrollFactor(0,0)
            .setInteractive();
            this.colorPicker[i].tint = colorsToPick[i];

            this.colorPicker[i].on('pointerdown', pointer => {    
                this.colorPicked = i;
            });
        }
        this.colorPicked = 0;

        // signalR
        this.signalrConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:44382/game')
            .build();

        this.signalrConnection.on('MapSize', data => {
            this.mapSize = data;
        });

        this.signalrConnection.on('Map', data => {
   
            for (let x = 0; x < this.mapSize; x++) {
                for (let y = 0; y < this.mapSize; y++) {
                    this.map.getTileAt(x,y).tint = colorsToPick[data[x][y]];
                }
            }
        });

        this.intervalId = window.setInterval(function() {
            if (this.colorsAtPostionsChanged.length > 0) {
                
                this.signalrConnection.invoke('SetMultipleColorsAtPositionsAsync', 
                    this.removeDuplicates(this.removeDuplicates(this.colorsAtPostionsChanged, 'x'), 'y'));
                
                this.colorsAtPostionsChanged = [];
            }   
            this.signalrConnection.invoke('GetMapAsync');

        }.bind(this), 500);

        this.signalrConnection.start()
            .then(() => this.signalrConnection.invoke('GetMapAsync'));
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
                selectedTile.tint = colorsToPick[this.colorPicked];
                this.colorsAtPostionsChanged.push({
                    x: pointerTileX,
                    y: pointerTileY,
                    color: this.colorPicked
                });
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

    removeDuplicates(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }
}