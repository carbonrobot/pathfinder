class Path {
    public open: Array<PathElement> = [];
    public closed: Array<PathElement> = [];
    public startTile: Tile;
    public targetTile: Tile;

    public constructor(public map: Map, public source: Player, public target: Player){
        this.startTile = this.map.getTileAt(source);
        this.targetTile = this.map.getTileAt(target);
    }

    public draw(){
        this.addToOpen(this.startTile, null, 0, 0);
        this.moveToClosed(this.open[0]); // shortcut
        this.seek(this.closed[0]);
    }

    private seek(parent: PathElement){
        if(parent.tile === this.targetTile){
            return;
        }
        console.log('seeking for', parent.tile.x, parent.tile.y);
                
        let adj = this.map.getAdjacentTiles(parent.tile);
        console.log('found', adj.length, 'adjacent tiles');

        adj = adj.filter((tile: Tile) => {
            return !(this.isClosed(tile) || this.isBlocked(tile));
        });
        console.log('found', adj.length, 'adjacent tiles not blocked or closed');

        adj.forEach((tile: Tile) => {
            const g = this.getMoveCost(parent.tile, tile) + parent.g;
            const h = this.getHCost(tile, this.targetTile);

            const openTile = this.isOpen(tile);
            if(openTile){
                // check path cost, update if lower
                if((g + h) < openTile.getFCost()){
                    console.log(g, h, openTile.getFCost());
                }
            }
            else{
                this.addToOpen(tile, parent, g, h);
            }
        });

        console.log('now', this.open.length, 'tiles on the open list');
        this.open.forEach((p: PathElement) => {
            p.draw('#00CC00');
        });

        let next: PathElement = this.open[0];
        this.open.forEach((p: PathElement) => {
            if(p.getFCost() < next.getFCost()){
                next = p;
            }
        });
        this.moveToClosed(next);

        console.log('now', this.closed.length, 'tiles on the closed list');
        this.closed.forEach((p: PathElement) => {
            p.draw('#1368F2');
        });

        this.seek(next);
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
    
    public getMoveCost(from: Tile, to: Tile){
        if(from === to){
            return 0;
        }

        // adj tiles = 10
        // angle tiles = 14, sqrt(2)*10
        if(from.x === to.x || from.y === to.y){
            return 10;
        }
        return 14;
    }

    public getHCost(from: Tile, to: Tile){
        const dx = Math.abs(from.x - to.x) / 10;
        const dy = Math.abs(from.y - to.y) / 10;
        return dx + dy;
    }

}

class PathElement {
    public constructor(public tile: Tile, public parent: PathElement, public g: number, public h: number){}

    public getFCost(){
        return this.g + this.h;
    }

    public draw(c){
        const t = new Tile(this.tile.x, this.tile.y, this.tile.w, this.tile.h);
        t.draw();
        t.border(c);

        // g cost
        Crafty.e('2D, DOM, Text')
            .attr({ x: this.tile.x + 10, y: this.tile.y + 80, w: 25, h: 25 })
            .textColor('white')
            .text(this.g.toString());

        // h cost
        Crafty.e('2D, DOM, Text')
            .attr({ x: this.tile.x + 80, y: this.tile.y + 80, w: 25, h: 25 })
            .textColor('white')
            .text(this.h.toString());

        // f cost
        Crafty.e('2D, DOM, Text')
            .attr({ x: this.tile.x + 10, y: this.tile.y + 10, w: 25, h: 25 })
            .textColor('white')
            .text((this.getFCost()).toString());
    }
}