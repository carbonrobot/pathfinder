declare var Crafty: any;

class Tile {
    private _e: any;

    public constructor(public x: number, public y: number, public w: number, public h: number, public c: string = '#000000') { }

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
