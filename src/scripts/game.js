/// <reference path="tile.ts" />

var CANVASID = 'game';
var TILEWIDTH = 100;
var TILEHEIGHT = 100;
var TILEMARGIN = 3;
var TILECOLOR = '#D1DDFF';
var OPENTILECOLOR = '#EBFFEB';
var CLOSEDTILECOLOR = '#66E889';
var ENDTILECOLOR = '#1D1DDB';
var BLOCKEDTILECOLOR = '#996837';


// main entry point
function init(){
    initCanvas();
    drawBoard();
    pathfinder();
}

// find the path
var start, end;
var tiles = [];
var closedtiles = [];
var opentiles = [];

function pathfinder(){
    // find the start pos and its coords
    start = tiles[gameboard.indexOf(1)];
    end = tiles[gameboard.indexOf(2)];

    // add the start to the closedtiles list
    closedtiles.push(start);
    
    // search for the next tile
    var currentTile = closedtiles[closedtiles.length - 1];
    //var nextTile = findNext(currentTile);    

    var ct = 0;
    while(ct < 2){

        // find the neighbors
        console.log(i);
        var moves = touch(currentTile);
        for(var i = 0; i < moves.length; i++){
            var tile = moves[i];
            
            // skip tile if blocked
            if(tileBlocked(tile)){
                continue;
            }

            // skip closed tiles
            if(closedtiles.indexOf(tile) >= 0){
                continue;
            }

            // set parent to the current tile
            tile.parent = currentTile;

            // determine cost of moving to this tile
            var gCost = getMoveCost(tile);
            var hCost = getHCost(tile);
            var cost = gCost + hCost;
            if(tileOpen(tile)){
                // determine if cost is less and update if it is
                if(cost < tile.moveCost()){
                    tile.gCost = gCost;
                    tile.hCost = hCost;
                }
            }
            else{
                tile.gCost = gCost;
                tile.hCost = hCost;
                opentiles.push(tile);
            }
        }

        // find the lowest cost open tile
        var lowestCost = opentiles[0];
        for(var j = 0; j < opentiles.length; j++){
            var tile = opentiles[j];
            if(tile.moveCost() < lowestCost.moveCost()){
                lowestCost = tile;
            }
        }

        opentiles.splice(opentiles.indexOf(lowestCost), 1);
        closedtiles.push(lowestCost);

        highlight(opentiles, OPENTILECOLOR, true);
        highlight(closedtiles, CLOSEDTILECOLOR);

        currentTile = lowestCost;

        ct++;
    }
}

function getHCost(t){
    var dx = end.x - t.x;
    var dy = end.y - t.y;
    return dx+dy;
}

function getMoveCost(t){
    // todo: tiles with slower movement (hills, etc)
    return t.baseMoveCost;
}

function tileBlocked(t){
    return t.color() === BLOCKEDTILECOLOR;
}

function tileOpen(t){
    return opentiles.indexOf(t) >= 0;
}

function highlight(k, color, showCost){
    for(var i = 0; i < k.length; i++){
        k[i].color(color);
        if(showCost){
            k[i].css('text-align', 'center');
            k[i].css('padding-top', '40px');
            k[i].text(k[i].gCost + '+' + k[i].hCost + '=' + k[i].moveCost());
        }
        if(k[i].parent){
            var x = k[i].x;
            var y = k[i].y;
            if(k[i].parent.x < k[i].x && k[i].parent.y === k[i].y){
                y = k[i].y + TILEHEIGHT/2;
            }
            if(k[i].parent.x === k[i].x && k[i].parent.y < k[i].y){
                x = k[i].x + TILEWIDTH/2;
            }
            if(k[i].parent.x > k[i].x && k[i].parent.y === k[i].y){
                x = k[i].x + TILEWIDTH - TILEMARGIN * 2;
                y = k[i].y + TILEHEIGHT/2;
            }
            if(k[i].parent.x === k[i].x && k[i].parent.y > k[i].y){
                x = k[i].x + TILEWIDTH/2;
                y = k[i].y + TILEHEIGHT - TILEMARGIN * 2;
            }
            if(k[i].parent.x > k[i].x && k[i].parent.y > k[i].y){
                x = k[i].x + TILEWIDTH - TILEMARGIN * 2;
                y = k[i].y + TILEHEIGHT - TILEMARGIN * 2;
            }
            if(k[i].parent.x < k[i].x && k[i].parent.y > k[i].y){
                y = k[i].y + TILEHEIGHT - TILEMARGIN * 2;
            }
            if(k[i].parent.x > k[i].x && k[i].parent.y < k[i].y){
                x = k[i].x + TILEWIDTH - TILEMARGIN * 2;
            }
            Crafty.e('2D, DOM, Color').attr({x: x, y: y, h: 5, w: 5}).color('#cc0000');
        }
    }
}

function touch(t){
    var idx = tiles.indexOf(t);
    console.log('Index of tile is', idx);

    return [
        tiles[idx - 1],
        tiles[idx + 1],
        tiles[idx + gameboard.cols],
        tiles[idx + gameboard.cols - 1],
        tiles[idx + gameboard.cols + 1],
        tiles[idx - gameboard.cols],
        tiles[idx - gameboard.cols - 1],
        tiles[idx - gameboard.cols + 1],
    ];
}




// create a tile
function drawTile(attr, color){
    attr.x = attr.x || 0;
    attr.y = attr.y || 0;
    attr.w = attr.w || TILEWIDTH;
    attr.h = attr.h || TILEHEIGHT;
    color = color || TILECOLOR;
    
    var t = Crafty.e('2D, DOM, Color, Text').attr(attr).color(color);
    t.baseMoveCost = 10;
    t.gCost = 0;
    t.hCost = 0;
    t.moveCost = function(){
        var parentCost = t.parent ? t.parent.moveCost() : 0;
        return this.hCost + this.gCost + parentCost;
    };
    return t;
}

function colorMap(idx){
    if(idx === 1){
        return CLOSEDTILECOLOR;
    }
    if(idx === 2){
        return ENDTILECOLOR;
    }
    if(idx === 8){
        return BLOCKEDTILECOLOR;
    }
    return TILECOLOR;
}

function board(w, h) {
    this.w = w;
    this.h = h;
};

init();