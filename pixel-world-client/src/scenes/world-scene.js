import tilesPng from './../assets/tiles.png';
import Phaser from 'phaser';

export default class WorldScene extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('tiles', tilesPng);
    }
      
    create ()
    {
        this.cameras.main.backgroundColor.setTo(128,128,128); 

        this.map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 1920, height: 1080});
        let tiles = this.map.addTilesetImage('tiles');
        let layer = this.map.createBlankLayer('layer1', tiles);
        layer.fill(0,0,0,1920,1080);

        this.marker = this.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, this.map.tileWidth, this.map.tileHeight);
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
                selectedTile.tint = 0xff00ff;
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
}