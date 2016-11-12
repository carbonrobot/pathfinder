var Tile = (function () {
    function Tile(x, y, w, h, c) {
        if (c === void 0) { c = '#000000'; }
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
    }
    Tile.prototype.draw = function () {
        this._e = Crafty.e('2D, DOM, Color, Text')
            .attr({ x: this.x, y: this.y, w: this.w, h: this.h })
            .color(this.c)
            .css('border', '1px solid white');
    };
    Tile.prototype.destroy = function () {
        this._e.destroy();
    };
    Tile.prototype.color = function (c) {
        this._e.color(c);
    };
    Tile.prototype.border = function (c) {
        this._e.css('border', '1px solid ' + c);
    };
    return Tile;
}());
/// <reference path="tile.ts" />
var Map = (function () {
    function Map(gameboard) {
        this.gameboard = gameboard;
        this.tiles = [];
        this.cols = 10;
        this.rows = gameboard.length / this.cols;
        console.log('creating map', this.cols, this.rows);
        // create the tiles
        for (var i = 0; i < this.rows; i++) {
            var y = i * (Map.TILEHEIGHT);
            for (var j = 0; j < this.cols; j++) {
                var x = j * (Map.TILEWIDTH);
                // const idx = i * this.cols + j;
                // const val = gameboard[idx]; 
                var t = new Tile(x, y, Map.TILEWIDTH, Map.TILEHEIGHT);
                this.tiles.push(t);
            }
        }
    }
    Map.prototype.getAdjacentTiles = function (tile) {
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
    };
    Map.prototype.getTileAt = function (_a) {
        var tx = _a.tx, ty = _a.ty;
        var idx = (ty - 1) * this.cols + tx - 1;
        return this.tiles[idx];
    };
    Map.prototype.draw = function (canvasId) {
        var width = this.cols * Map.TILEWIDTH;
        var height = this.rows * Map.TILEHEIGHT;
        Crafty.init(width, height, document.getElementById(canvasId));
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].draw();
        }
    };
    Map.TILEWIDTH = 100;
    Map.TILEHEIGHT = 100;
    return Map;
}());
var Player = (function () {
    function Player() {
        this.c = '#0000FF';
        this.w = 30;
        this.h = 30;
    }
    Player.prototype.moveTo = function (tx, ty) {
        this.tx = tx;
        this.ty = ty;
    };
    Player.prototype.draw = function (map) {
        this.x = (this.tx * Map.TILEWIDTH) - (Map.TILEWIDTH / 2) - (this.w / 2);
        this.y = (this.ty * Map.TILEHEIGHT) - (Map.TILEHEIGHT / 2) - (this.h / 2);
        this._e = Crafty.e('2D, DOM, Color')
            .attr({ x: this.x, y: this.y, w: this.w, h: this.h })
            .color(this.c);
    };
    return Player;
}());
var Path = (function () {
    function Path(map, source, target) {
        this.map = map;
        this.source = source;
        this.target = target;
        this.open = [];
        this.closed = [];
        this.startTile = this.map.getTileAt(source);
        this.targetTile = this.map.getTileAt(target);
    }
    Path.prototype.draw = function () {
        this.addToOpen(this.startTile, null, 0, 0);
        this.moveToClosed(this.open[0]); // shortcut
        this.seek(this.closed[0]);
    };
    Path.prototype.seek = function (parent) {
        var _this = this;
        if (parent.tile === this.targetTile) {
            return;
        }
        console.log('seeking for', parent.tile.x, parent.tile.y);
        var adj = this.map.getAdjacentTiles(parent.tile);
        console.log('found', adj.length, 'adjacent tiles');
        adj = adj.filter(function (tile) {
            return !(_this.isClosed(tile) || _this.isBlocked(tile));
        });
        console.log('found', adj.length, 'adjacent tiles not blocked or closed');
        adj.forEach(function (tile) {
            var g = _this.getMoveCost(parent.tile, tile) + parent.g;
            var h = _this.getHCost(tile, _this.targetTile);
            var openTile = _this.isOpen(tile);
            if (openTile) {
                // check path cost, update if lower
                if ((g + h) < openTile.getFCost()) {
                    console.log(g, h, openTile.getFCost());
                }
            }
            else {
                _this.addToOpen(tile, parent, g, h);
            }
        });
        console.log('now', this.open.length, 'tiles on the open list');
        this.open.forEach(function (p) {
            p.draw('#00CC00');
        });
        var next = this.open[0];
        this.open.forEach(function (p) {
            if (p.getFCost() < next.getFCost()) {
                next = p;
            }
        });
        this.moveToClosed(next);
        console.log('now', this.closed.length, 'tiles on the closed list');
        this.closed.forEach(function (p) {
            p.draw('#1368F2');
        });
        this.seek(next);
    };
    Path.prototype.addToOpen = function (tile, parent, g, h) {
        console.log('adding', tile.x, tile.y, 'to open list');
        this.open.push(new PathElement(tile, parent, g, h));
    };
    Path.prototype.isBlocked = function (tile) {
        return false;
    };
    Path.prototype.isOpen = function (tile) {
        return this.findInList(this.open, tile);
    };
    Path.prototype.isClosed = function (tile) {
        return this.findInList(this.closed, tile);
    };
    Path.prototype.findInList = function (list, tile) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].tile === tile) {
                return list[i];
            }
        }
        return false;
    };
    Path.prototype.moveToClosed = function (element) {
        var tile = this.open.splice(this.open.indexOf(element), 1)[0];
        this.closed.push(tile);
    };
    Path.prototype.getMoveCost = function (from, to) {
        if (from === to) {
            return 0;
        }
        // adj tiles = 10
        // angle tiles = 14, sqrt(2)*10
        if (from.x === to.x || from.y === to.y) {
            return 10;
        }
        return 14;
    };
    Path.prototype.getHCost = function (from, to) {
        var dx = Math.abs(from.x - to.x) / 10;
        var dy = Math.abs(from.y - to.y) / 10;
        return dx + dy;
    };
    return Path;
}());
var PathElement = (function () {
    function PathElement(tile, parent, g, h) {
        this.tile = tile;
        this.parent = parent;
        this.g = g;
        this.h = h;
    }
    PathElement.prototype.getFCost = function () {
        return this.g + this.h;
    };
    PathElement.prototype.draw = function (c) {
        var t = new Tile(this.tile.x, this.tile.y, this.tile.w, this.tile.h);
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
    };
    return PathElement;
}());
/// <reference path="map.ts" />
/// <reference path="player.ts" />
/// <reference path="path.ts" />
var CANVASID = 'game';
var OPENTILECOLOR = '#EBFFEB';
var CLOSEDTILECOLOR = '#66E889';
var ENDTILECOLOR = '#1D1DDB';
var BLOCKEDTILECOLOR = '#996837';
var gameboard = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];
var map = new Map(gameboard);
var player = new Player();
player.moveTo(3, 3);
var target = new Player();
target.c = '#CC0000';
target.moveTo(8, 3);
var path = new Path(map, player, target);
// render in the correct order
map.draw(CANVASID);
path.draw();
player.draw(map);
target.draw(map);
//# sourceMappingURL=app.js.map