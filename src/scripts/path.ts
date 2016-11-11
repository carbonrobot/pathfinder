class Path {
    public open: Array<PathElement> = [];
    public closed: Array<PathElement> = [];

    public constructor(public map: Map, public source: Player, public target: Player){

    }

    public draw(){
        let start = this.map.getTileAt(this.source);
        this.addToOpen(start, null, 0, 0);
        this.moveToClosed(this.open[0]); // shortcut
        this.seek(this.closed[0]);
    }

    private seek(parent: PathElement){
        console.log('seeking for', parent.tile.x, parent.tile.y);
        let adj = this.map.getAdjacentTiles(parent.tile);
        console.log('found', adj.length, 'adjacent tiles');

        adj = adj.filter((tile: Tile) => {
            return !(this.isClosed(tile) || this.isBlocked(tile));
        });
        console.log('found', adj.length, 'adjacent tiles not blocked or closed');

        adj.forEach((tile: Tile) => {
            const g = 0;
            const h = 0;
            this.addToOpen(tile, parent, g, h);
        });

        console.log('now', this.open.length, 'tiles on the open list');
        this.open.forEach((p: PathElement) => {
            p.draw();
        });
    }

    private addToOpen(tile: Tile, parent: PathElement, g: number, h: number){
        console.log('adding', tile.x, tile.y, 'to open list');
        this.open.push(new PathElement(tile, parent, g, h));
    }

    private isBlocked(tile: Tile){
        return false;
    }

    private isOpen(tile: Tile){
        return this.findInList(this.open, tile);
    }

    private isClosed(tile: Tile){
        return this.findInList(this.closed, tile);
    }

    private findInList(list: Array<PathElement>, tile: Tile): any {
        for(let i = 0; i < list.length; i++){
            if(list[i].tile === tile){
                return list[i];
            }
        }
        return false;
    }

    private moveToClosed(element: PathElement){
        const tile = this.open.splice(this.open.indexOf(element), 1)[0];
        this.closed.push(tile);
    }

}

class PathElement {
    private _e: Tile;

    public constructor(public tile: Tile, public parent: PathElement, public g: number, public h: number){}

    public draw(){
        if(this._e){
            this._e.destroy();
        }
        const t = new Tile(this.tile.x, this.tile.y, this.tile.w, this.tile.h);
        t.draw();
        t.border('#00CC00');
        this._e = t;
    }
}