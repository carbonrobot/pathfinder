/// <reference path="tile.ts" />

declare var Crafty: any;

class Map {

    public static readonly TILEWIDTH = 100;
    public static readonly TILEHEIGHT = 100;

    public cols: number;
    public rows: number;
    private tiles: Array<Tile> = [];

    public constructor(private gameboard: Array<number>){
        this.cols = 10;
        this.rows = gameboard.length / this.cols;

        console.log('creating map', this.cols, this.rows);

        // create the tiles
        for (var i = 0; i < this.rows; i++) {
            var y = i * (Map.TILEHEIGHT);
            for (var j = 0; j < this.cols; j++) {
                const x = j * (Map.TILEWIDTH);
                // const idx = i * this.cols + j;
                // const val = gameboard[idx]; 
                const t = new Tile(x, y, Map.TILEWIDTH, Map.TILEHEIGHT);
                this.tiles.push(t);
            }
        }
    }

    public getAdjacentTiles(tile: Tile){
        var idx = this.tiles.indexOf(tile);

        return [
            this.tiles[idx - 1],
            this.tiles[idx + 1],
            this.tiles[idx + this.cols],
            this.tiles[idx + this.cols - 1],
            this.tiles[idx + this.cols + 1],
            this.tiles[idx - this.cols],
            this.tiles[idx - this.cols - 1],
            this.tiles[idx - this.cols + 1],
        ];
    }

    public getTileAt({tx, ty}){
        const idx = (ty - 1) * this.cols + tx - 1;
        return this.tiles[idx];
    }

    public draw(canvasId: string) {
        var width = this.cols * Map.TILEWIDTH;
        var height = this.rows * Map.TILEHEIGHT;

        Crafty.init(width, height, document.getElementById(canvasId));

        for(let i = 0; i < this.tiles.length; i++){
            this.tiles[i].draw();
        }
    }

}