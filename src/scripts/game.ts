/// <reference path="map.ts" />
/// <reference path="player.ts" />
/// <reference path="path.ts" />

const CANVASID = 'game';
const OPENTILECOLOR = '#EBFFEB';
const CLOSEDTILECOLOR = '#66E889';
const ENDTILECOLOR = '#1D1DDB';
const BLOCKEDTILECOLOR = '#996837';

const gameboard = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 8, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
];

const map = new Map(gameboard);
map.draw(CANVASID);

const player = new Player();
player.moveTo(3, 3);
player.draw(map);

const target = new Player();
target.c = '#CC0000';
target.moveTo(8, 3);
target.draw(map);

const path = new Path(map, player, target);
path.draw();