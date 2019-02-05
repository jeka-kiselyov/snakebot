const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');
const ArrayHelper = require('./ArrayHelper.js');

const GameVector = require('./GameVector.js');
const GameTargetList = require('./GameTargetList.js');

/**
 * GameSurround is Face-oriented portion of gameboard
 */
class GameSurround { 
	constructor(matrix = []) {
		this._matrix = matrix;
		this._height = matrix.length;
		this._width = matrix[0].length;

		this._vectors = {
			forward: this.getForwardVector(),
			leftward: this.getLeftwardVector(),
			rightward: this.getRightwardVector()
		};

		this._targetCoordinates = null;

		this._headPosition = this.getHeadPosition() || {x: 0, y: 0};
		this._tailPosition = this.getTailPosition() || {x: 0, y: 0};

		// this._vectors.forward.log();
		// console.log(333);
		// 

		this._targetList = new GameTargetList({
			gameSurround: this
		});
	}

	get targetList() {
		return this._targetList;
	}

	isPlayerFury() {
		if (this._matrix[this.headPosition.y][this.headPosition.x] == GameBoardConstants.ELEMENT.HEAD_EVIL) {
			return true;
		} else {
			return false;
		}
	}

	isPlayerFly() {
		if (this._matrix[this.headPosition.y][this.headPosition.x] == GameBoardConstants.ELEMENT.HEAD_FLY) {
			return true;
		} else {
			return false;
		}
	}

	get playerSnakeLength() {
		let shiftX = [-1, 0, 0, 1]; /// shifts
		let shiftY = [0, -1, 1, 0]; 

		let visited = Array(this.width).fill(false).map(() => {return Array(this.height).fill(false)});
		let length = 1;
		let lookPosition = {x: this.headPosition.x, y: this.headPosition.y};
		
					// console.log('head. x: '+lookPosition.x, 'y: '+lookPosition.y);
		let foundMore = false;
		do {
			visited[lookPosition.y][lookPosition.x] = true;
			foundMore = false;
			for (let i = 0; (!foundMore && i < shiftX.length); i++) {
				let lookAtX = lookPosition.x + shiftX[i];
				let lookAtY = lookPosition.y + shiftY[i];

				if (lookAtX >= 0 && lookAtX < this.width && lookAtY >= 0 && lookAtY < this.height && !visited[lookAtY][lookAtX] &&
					GameBoardConstants.ELEMENTS.isPlayerSnakeElement(this._matrix[lookAtY][lookAtX]) ) {
					
					// console.log('x: '+lookAtX, 'y: '+lookAtY);

					length++;
					lookPosition.x = lookAtX;
					lookPosition.y = lookAtY;

					foundMore = true;
				}
			}
		} while(foundMore);

		return length;
	}

	get tailPosition() {
		return this._tailPosition;
	}

	get headPosition() {
		return this._headPosition;
	}

	get vectors() {
		return this._vectors;
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}

	log() {
		UIHelper.logTwoDimArray(this._matrix);	
		console.log('W: '+this._width+'  H: '+this._height);

		let fl = this.getForwardVector();
	}

	getTailPosition() {
	    return this.getFirstPositionOf([
	        GameBoardConstants.ELEMENT.TAIL_END_DOWN,
	        GameBoardConstants.ELEMENT.TAIL_END_LEFT,
	        GameBoardConstants.ELEMENT.TAIL_END_UP,
	        GameBoardConstants.ELEMENT.TAIL_END_RIGHT,
	        GameBoardConstants.ELEMENT.TAIL_INACTIVE
	    ]);
	}

	getHeadPosition() {
	    return this.getFirstPositionOf([
	        GameBoardConstants.ELEMENT.HEAD_DOWN,
	        GameBoardConstants.ELEMENT.HEAD_LEFT,
	        GameBoardConstants.ELEMENT.HEAD_RIGHT,
	        GameBoardConstants.ELEMENT.HEAD_UP,
	        GameBoardConstants.ELEMENT.HEAD_DEAD,
	        GameBoardConstants.ELEMENT.HEAD_EVIL,
	        GameBoardConstants.ELEMENT.HEAD_FLY,
	        GameBoardConstants.ELEMENT.HEAD_SLEEP,
	    ]);
	}

	getFirstPositionOf(elements) {
	    for (let i = 0; i < elements.length; i++) {
	        let element = elements[i];
	        for (let x = 0; x < this.width; x++) {
	        	for (let y = 0; y < this.height; y++) {
	        		if (this._matrix[y][x] == element) {
	        			return {
	        				x: x,
	        				y: y
	        			};
	        		}
	        	}
	        }
	    }
	    return null;
	}

	getForwardVector() {
		let cX = Math.floor(this.width / 2);
		let cY = Math.floor(this.height / 2);
		let vector = [];

		for (let y = cY - 1; y >= 0; y--) {
			vector.push(this._matrix[y][cX]);
		}

		return new GameVector(vector);
	}

	getLeftwardVector() {
		let cX = Math.floor(this.width / 2);
		let cY = Math.floor(this.height / 2);
		let vector = [];

		for (let x = cX - 1; x >= 0; x--) {
			vector.push(this._matrix[cY][x]);
		}

		return new GameVector(vector);
	}

	getRightwardVector() {
		let cX = Math.floor(this.width / 2);
		let cY = Math.floor(this.height / 2);
		let vector = [];

		for (let x = cX + 1; x < this.width; x++) {
			vector.push(this._matrix[cY][x]);
		}

		return new GameVector(vector);
	}
}

module.exports = GameSurround;