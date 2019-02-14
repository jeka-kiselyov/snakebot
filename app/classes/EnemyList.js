const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');
const ArrayHelper = require('./ArrayHelper.js');

const Enemy = require('./Enemy.js');

class EnemyList { 
	constructor(params = {}) {
		this._gameSurround = params.gameSurround || null;
		this._enemies = [];
	}

	get enemies() {
		if (!this._enemies.length) {
			this.fillEnemies();
		}

		return this._enemies;
	}

	filterEnemies(states) {
		if (!Array.isArray(states)) {
			states = [states];
		}
		
		return this.enemies.filter(enemy => { console.log(enemy.state); return (states.indexOf(enemy.state) != -1) });
	}

	get gameSurround() {
		return this._gameSurround;
	}

	fillEnemies() {
		this._enemies = [];

        for (let x = 0; x < this.gameSurround.width; x++) {
        	for (let y = 0; y < this.gameSurround.height; y++) {
        		if (GameBoardConstants.ELEMENTS.enemyHeadElements.indexOf(this.gameSurround._matrix[y][x]) != -1) {
        			let headPosition = {x: x, y: y};
        			let enemy = new Enemy({
        					headPosition: headPosition,
        					gameSurround: this._gameSurround
	        			});

        			this._enemies.push(enemy);
        		}
    		}
    	}
	}
}

module.exports = EnemyList;