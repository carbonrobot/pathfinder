var CANVASID = 'game';
var TILEWIDTH = 100;
var TILEHEIGHT = 100;
var TILEMARGIN = 3;
var TILECOLOR = '#D1DDFF';
var OPENTILECOLOR = '#EBFFEB';
var CLOSEDTILECOLOR = '#66E889';
var ENDTILECOLOR = '#1D1DDB';
var BLOCKEDTILECOLOR = '#996837';

var gameboard = [
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,8,0,0,0,0,0,
    0,1,0,0,8,0,0,0,0,0,
    0,0,0,0,8,0,0,2,0,0,
    0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,0,0,0,0,0,0
];
gameboard.cols = 10;
gameboard.rows = gameboard.length / gameboard.cols;

// main entry point
function init(){
    initCanvas();
    drawBoard();
    pathfinder();
}

// find the path
var tiles = [];
var closedtiles = [];
var opentiles = [];

function pathfinder(){
    // find the start pos and its coords
    var start = tiles[gameboard.indexOf(1)];
    var end = tiles[gameboard.indexOf(2)];

    // add the start to the closedtiles list
    closedtiles.push(start);
    
    // search for the next tile
    var nextTile = findNext(start);
    var i = 0;
    while(i < 5){
    
        // remove it from the open list
        opentiles.splice(opentiles.indexOf(nextTile), 1);

        // set the parent to navigate back
        nextTile.parent = start;

        // add to the closed set for tracking
        closedtiles.push(nextTile);
        
        highlight(opentiles, OPENTILECOLOR, true);
        highlight(closedtiles, CLOSEDTILECOLOR);

        nextTile = findNext(nextTile);

        i++;
    }
}

function findNext(start){
    // find the neighbors
    var moves = touch(start);
    for(var i = 0; i < moves.length; i++){
        var tile = moves[i];
        
        // skip tile if blocked
        if(tileBlocked(tile)){
            continue;
        }

        // skip start tile
        if(tile == start){
            continue;
        }

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

    return lowestCost;
}

function getHCost(t){
    // todo: account for distance to finish
    return 2;
}

function getMoveCost(t){
    // todo: diag tiles 14
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


// init the game board
function initCanvas(){
    var width = (gameboard.cols * TILEWIDTH) + (gameboard.cols * TILEMARGIN);
    var height = (gameboard.rows * TILEWIDTH) + (gameboard.rows * TILEMARGIN); 
    Crafty.init(width, height, document.getElementById(CANVASID));
}

// create the game surface
function drawBoard(){
    for(var i = 0; i < gameboard.rows; i++){
        var y = i * (TILEHEIGHT + TILEMARGIN);
        for(var j = 0; j < gameboard.cols; j++){
            var x = j * (TILEWIDTH + TILEMARGIN);
            var idx = i * gameboard.cols + j;
            tiles.push(drawTile({x:x, y:y}, colorMap(gameboard[idx])));
        }
    }
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
    t.moveCost = function(){
        return this.hCost + this.gCost;
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