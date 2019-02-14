const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');
const ArrayHelper = require('./ArrayHelper.js');

const GameTargetList = require('./GameTargetList.js');
const Path = require('./Path.js');

class Enemy { 
	constructor(params = {}) {
		this._gameTargetList = params.gameTargetList || null;
		this._gameSurround = params.gameSurround || null;

		this._headPosition = params.headPosition || null;
		this._tailPosition = params.tailPosition || null;

		this._distancesTo = {};

		this._state = Enemy.STATE.DEFAULT;
		this._length = null;
		this._stateCalculated = false;

		this._nextMovePositions = [];

		this._targetList = new GameTargetList({
			gameSurround: this._gameSurround
		});

		this._possiblePaths = [];
	}

	isFury() {
		return (this.state == Enemy.STATE.FURY);
	}

	isLong() {
		return (this.state == Enemy.STATE.LONG); 
	}

	isActive() {
		return (this.state != Enemy.STATE.DEAD && this.state != Enemy.SLEEP); 
	}

	isOneCellAhead() {
		let playerPosition = this._gameSurround.headPosition;
		let distance = Math.abs(playerPosition.x - this._headPosition.x) + Math.abs(playerPosition.y - this._headPosition.y);
		if (distance <= 1) {
			return true;
		} else {
			return false;
		}
	}

	mark2CellsAsDangerous(n = 2) {
		let toBeMarkedAsDangerousElements = [];
		for (let k of GameBoardConstants.TAGS.TOBEMARKEDASDANGEROUS) {
			toBeMarkedAsDangerousElements.push(GameBoardConstants.ELEMENT[k]);
		}
		for (let i = 0; i < this.nextMovePositions.length; i++) {	
			if (toBeMarkedAsDangerousElements.indexOf(this._gameSurround.matrix[this.nextMovePositions[i].y][this.nextMovePositions[i].x]) != -1) {
				if (n>=1) {
					this._gameSurround.matrix[this.nextMovePositions[i].y][this.nextMovePositions[i].x] = GameBoardConstants.ELEMENT.ENEMY_LONGER_HEAD_POSSIBLE_MOVES;					
				}

				if (n>=2) {
					let shiftX = [-1, 0, 0, 1]; /// shifts
					let shiftY = [0, -1, 1, 0]; 

					for (let j = 0; j < shiftX.length; j++) {
						let nx = this.nextMovePositions[i].x + shiftX[j];
						let ny = this.nextMovePositions[i].y + shiftY[j];

						if (toBeMarkedAsDangerousElements.indexOf(this._gameSurround.matrix[ny][nx]) != -1) {
							this._gameSurround.matrix[ny][nx] = GameBoardConstants.ELEMENT.ENEMY_LONGER_HEAD_POSSIBLE_MOVES;						
						}
					}
				}		
			}		

		}
	}

	get state() {
		if (!this._stateCalculated) {
			this.calculateState();
		}

		return this._state;
	}

	get length() {
		if (!this._stateCalculated) {
			this.calculateState();
		}

		return this._length;
	}

	get nextMovePositions() {
		if (!this._nextMovePositions.length) {
			this.calculateExpectedNextMovePositions();
		}

		return this._nextMovePositions;
	}

	get possiblePaths() {
		if (!this._possiblePaths.length) {
			this.calculatePossiblePaths();
		}

		return this._possiblePaths;
	}

	getClosestTargetPath() {
		let possiblePaths = this.possiblePaths;
		possiblePaths = possiblePaths.sort(function(a, b){
			a = a.distance;
			b = b.distance;
			return a == b ? 0 : +(a > b) || -1;
		});

		// for (let path of possiblePaths) {
		// 	console.log(''+path);
		// }

		return possiblePaths.length ? possiblePaths[0] : null;
	}

	getClosestTarget() {
		let closestTargetPath = this.getClosestTargetPath();
		return closestTargetPath ? closestTargetPath.target : null;
	}

	calculatePossiblePaths() {
		if (!this._stateCalculated) {
			this.calculateState();
		}

		let nextMovePositions = this.nextMovePositions;
		let targets = this._targetList.targets;

		for (let nextMovePosition of nextMovePositions) {
			for (let target of targets) {
				let toPosition = {x: target.x, y: target.y};
				let path = new Path({
					from: nextMovePosition,
					to: toPosition,
					distance: this._targetList.bestDistanceBetweenPoints(nextMovePosition, toPosition, true) + 1,
					target: target
				});

				this._possiblePaths.push(path);
			}
		}


		return this._possiblePaths;
	}

	calculateExpectedNextMovePositions() {
		let shiftX = [-1, 0, 0, 1]; /// shifts
		let shiftY = [0, -1, 1, 0]; 

		let allowedElements = GameBoardConstants.ELEMENTS.enemyPossibleNextMoveElements;

		for (let i = 0; i < shiftX.length; i++) {
			let lookAtX = this._headPosition.x + shiftX[i];
			let lookAtY = this._headPosition.y + shiftY[i];

			if (lookAtX >= 0 && lookAtX < this._gameSurround.width && lookAtY >= 0 && lookAtY < this._gameSurround.height && 
				allowedElements.indexOf(this._gameSurround.matrix[lookAtY][lookAtX]) != -1) {
				this._nextMovePositions.push({x: lookAtX, y: lookAtY});
			}
		}

		return this._nextMovePositions;
	}

	calculateLength() {
		let shiftX = [-1, 0, 0, 1]; /// shifts
		let shiftY = [0, -1, 1, 0]; 

		let visited = Array(this._gameSurround.width).fill(false).map(() => {return Array(this._gameSurround.height).fill(false)});
		let length = 1;
		let lookPosition = {x: this._headPosition.x, y: this._headPosition.y};
		// console.log(GameBoardConstants.ELEMENTS.enemyBodyElements);
		let foundMore = false;
		do {
			visited[lookPosition.y][lookPosition.x] = true;
			foundMore = false;
			for (let i = 0; (!foundMore && i < shiftX.length); i++) {
				let lookAtX = lookPosition.x + shiftX[i];
				let lookAtY = lookPosition.y + shiftY[i];

				if (lookAtX >= 0 && lookAtX < this._gameSurround.width && lookAtY >= 0 && lookAtY < this._gameSurround.height && !visited[lookAtY][lookAtX] &&
					GameBoardConstants.ELEMENTS.enemyBodyElements.indexOf(this._gameSurround.matrix[lookAtY][lookAtX]) != -1) {
					
					// console.log('x: '+lookAtX, 'y: '+lookAtY);

					length++;
					lookPosition.x = lookAtX;
					lookPosition.y = lookAtY;

					foundMore = true;
				}
			}
		} while(foundMore);

		this._length = length + 1; /// +1 for tail

		return length;		
	}

	calculateState() {
		this.calculateLength();

		let headElement = this._gameSurround.matrix[this._headPosition.y][this._headPosition.x];
		if (headElement == GameBoardConstants.ELEMENT.ENEMY_HEAD_DEAD) {
			this._state = Enemy.STATE.DEAD;
		} else if (headElement == GameBoardConstants.ELEMENT.ENEMY_HEAD_EVIL) {
			this._state = Enemy.STATE.FURY;
		} else if (headElement == GameBoardConstants.ELEMENT.ENEMY_HEAD_FLY) {
			this._state = Enemy.STATE.FLY;
		} else if (headElement == GameBoardConstants.ELEMENT.ENEMY_HEAD_SLEEP) {
			this._state = Enemy.STATE.SLEEP;
		} else {
			///@todo: long
			this._state = Enemy.STATE.DEFAULT;
		}

		this._targetList.setState('ENEMY'+this._state);
		this._stateCalculated = true;
		return this._state;
	}
}

Enemy.STATE = {};
Enemy.STATE.DEAD = 'DEAD';
Enemy.STATE.SLEEP = 'SLEEP';
Enemy.STATE.FURY = 'FURY';
Enemy.STATE.DEFAULT = 'DEFAULT';
Enemy.STATE.LONG = 'LONG';
Enemy.STATE.FLY = 'FLY';

module.exports = Enemy;