declare var Crafty: any;

class Player {
    
    public c: string = '#0000FF';
    public w: number = 30;
    public h: number = 30;
    public tx: number;
    public ty: number;
    public x: number;
    public y: number;

    private _e: any;

    public moveTo(tx: number, ty: number){
        this.tx = tx;
        this.ty = ty;
    }
    
    public draw(map: Map){
        this.x = (this.tx * Map.TILEWIDTH) - (Map.TILEWIDTH / 2) - (this.w / 2);
        this.y = (this.ty * Map.TILEHEIGHT) - (Map.TILEHEIGHT / 2) - (this.h / 2);

        this._e = Crafty.e('2D, DOM, Color')
            .attr({ x: this.x, y: this.y, w: this.w, h: this.h })
            .color(this.c);
    }
}