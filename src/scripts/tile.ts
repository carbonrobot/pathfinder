declare var Crafty: any;

class Tile {
    public static readonly DefaultColor : string = '#000000';
    public static readonly BlockedColor : string = '#4f311c';

    private _e: any;
    private _isBlocked: boolean = false;

    public baseMovementCost: number = 10;
    public get isBlocked(): boolean {
        return this._isBlocked;
    }
    public set isBlocked(value: boolean){
        this._isBlocked = value;
        this.c = this._isBlocked ? Tile.BlockedColor : Tile.DefaultColor;
    }

    public constructor(public x: number, public y: number, public w: number, public h: number, public c: string = Tile.DefaultColor) { }

    public draw() {
        this._e = Crafty.e('2D, DOM, Color, Text')
            .attr({ x: this.x, y: this.y, w: this.w, h: this.h })
            .color(this.c)
            .css('border', '1px solid white');
    }

    public destroy(){
        this._e.destroy();
    }

    public color(c: string){
        this._e.color(c);
    }

    public border(c: string){
        this._e.css('border', '1px solid ' + c);
    }
}
