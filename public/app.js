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
    }
    Path.prototype.draw = function () {
        var start = this.map.getTileAt(this.source);
        this.addToOpen(start, null, 0, 0);
        this.moveToClosed(this.open[0]); // shortcut
        this.seek(this.closed[0]);
    };
    Path.prototype.seek = function (parent) {
        var _this = this;
        console.log('seeking for', parent.tile.x, parent.tile.y);
        var adj = this.map.getAdjacentTiles(parent.tile);
        console.log('found', adj.length, 'adjacent tiles');
        adj = adj.filter(function (tile) {
            return !(_this.isClosed(tile) || _this.isBlocked(tile));
        });
        console.log('found', adj.length, 'adjacent tiles not blocked or closed');
        adj.forEach(function (tile) {
            var g = 0;
            var h = 0;
            _this.addToOpen(tile, parent, g, h);
        });
        console.log('now', this.open.length, 'tiles on the open list');
        this.open.forEach(function (p) {
            p.draw();
        });
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
    return Path;
}());
var PathElement = (function () {
    function PathElement(tile, parent, g, h) {
        this.tile = tile;
        this.parent = parent;
        this.g = g;
        this.h = h;
    }
    PathElement.prototype.draw = function () {
        if (this._e) {
            this._e.destroy();
        }
        var t = new Tile(this.tile.x, this.tile.y, this.tile.w, this.tile.h);
        t.draw();
        t.border('#00CC00');
        this._e = t;
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
map.draw(CANVASID);
var player = new Player();
player.moveTo(3, 3);
player.draw(map);
var target = new Player();
target.c = '#CC0000';
target.moveTo(8, 3);
target.draw(map);
var path = new Path(map, player, target);
path.draw();
//# sourceMappingURL=app.js.map