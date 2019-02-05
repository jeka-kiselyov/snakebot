const {Program,Command,LovaClass} = require('lovacli');
const WebSocket = require('ws');

const GameBoardConstants = require('./GameBoardConstants.js');
const GameSurround = require('./GameSurround.js');
const ArrayHelper = require('./ArrayHelper.js');
const UIHelper = require('./UIHelper.js');

// https://epam-bot-challenge.com.ua/board

class GameBoard extends LovaClass { /// EventEmmiter
	constructor(board) {
		super();

		this._ws = null;

		this._rawBoard = board;
		this._board = board;

		this._playerHeadPosition = this.getHeadPosition() || {x: 0, y: 0};
		this._playerDirection = this.getSnakeDirection(this._playerHeadPosition);

		this._command = null;

		// @todo: need this as option?
		this.closeAllTraps();

		this._allFieldSurround = this.getAllFieldSurround(true);
		// this._allFieldSurround.log();
		// this.log();
	}

	get playerHeadPosition() {
		return this._playerHeadPosition;
	}

	get allFieldSurround() {
		return this._allFieldSurround;
	}

	get size() {
		return Math.sqrt(this._board.length);
	}

	log() {
		UIHelper.logTwoDimArray(this.asMatrix());	
	}

	asMatrix() {
		var result = [];
		for (var i = 0; i < this.size; i++) {
			result.push([...this._board.substring(i * this.size, (i + 1) * this.size)]);  // http://www.ecma-international.org/ecma-262/6.0/#sec-array-initializer
		}
		return result;
	}

	asArray(raw = false) {
		var result = [];
		if (raw) {
			for (var i = 0; i < this.size; i++) {
				result.push(this._rawBoard.substring(i * this.size, (i + 1) * this.size));
			}
		} else {
			for (var i = 0; i < this.size; i++) {
				result.push(this._board.substring(i * this.size, (i + 1) * this.size));
			}			
		}
		return result;
	}

	moveToCommand(move) {
		// translate move to command, depending on snake's direction
		// move:forward - do nothing
		// move:leftward -
		//     direction:up = LEFT
		//     direction:right = UP
		//     direction:down = RIGHT
		//     direction:left = DOWN
		// move:rightward -
		//     direction:up = RIGHT
		//     direction:right = DOWN
		//     direction:down = LEFT
		//     direction:left = UP
		this._command = null;

		let playerSnakeDirection = this._playerDirection;
		if (move == 'forward' || move == 'FORWARD') {
			this._command = null;
		}
		if (move == 'leftward' || move == 'LEFTWARD') {
			if (playerSnakeDirection == 'up') {
				this._command = 'LEFT';
			} else if (playerSnakeDirection == 'right') {
				this._command = 'UP';
			} else if (playerSnakeDirection == 'down') {
				this._command = 'RIGHT';
			} else if (playerSnakeDirection == 'left') {
				this._command = 'DOWN';
			}
		}
		if (move == 'rightward' || move == 'RIGHTWARD') {
			if (playerSnakeDirection == 'up') {
				this._command = 'RIGHT';
			} else if (playerSnakeDirection == 'right') {
				this._command = 'DOWN';
			} else if (playerSnakeDirection == 'down') {
				this._command = 'LEFT';
			} else if (playerSnakeDirection == 'left') {
				this._command = 'UP';
			}
		}

		return this._command;
	}

	getSnakeDirection(headPosition = null) {
		headPosition = headPosition || this._playerHeadPosition;

		/// @todo: cover with tests
		/// @todo: calculate enemy snakes directions too

    	let elements = {
    		head: this.getElementByXY({x: headPosition.x, y: headPosition.y}),
    		above: this.getElementByXY({x: headPosition.x, y: headPosition.y - 1}),
    		below: this.getElementByXY({x: headPosition.x, y: headPosition.y + 1}),
    		left: this.getElementByXY({x: headPosition.x - 1, y: headPosition.y}),
    		right: this.getElementByXY({x: headPosition.x + 1, y: headPosition.y})
    	};

    	if (elements.head == GameBoardConstants.ELEMENT.HEAD_UP) {
    		return 'up';
    	}
    	if (elements.head == GameBoardConstants.ELEMENT.HEAD_DOWN) {
    		return 'down';
    	}
    	if (elements.head == GameBoardConstants.ELEMENT.HEAD_RIGHT) {
    		return 'right';
    	}
    	if (elements.head == GameBoardConstants.ELEMENT.HEAD_LEFT) {
    		return 'left';
    	}

    	// let direction = null;
    	if (elements.above == GameBoardConstants.ELEMENT.BODY_VERTICAL 
    		|| elements.above == GameBoardConstants.ELEMENT.TAIL_END_UP 
    		|| elements.above == GameBoardConstants.ELEMENT.BODY_LEFT_DOWN
    		|| elements.above == GameBoardConstants.ELEMENT.BODY_RIGHT_DOWN) {
    		return 'down';
    	} else if (elements.below == GameBoardConstants.ELEMENT.BODY_VERTICAL
    		|| elements.below == GameBoardConstants.ELEMENT.TAIL_END_DOWN 
    		|| elements.below == GameBoardConstants.ELEMENT.BODY_LEFT_UP
    		|| elements.below == GameBoardConstants.ELEMENT.BODY_RIGHT_UP) {
    		return 'up';
    	} else if (elements.left == GameBoardConstants.ELEMENT.BODY_HORIZONTAL
    		|| elements.left == GameBoardConstants.ELEMENT.TAIL_END_LEFT 
    		|| elements.left == GameBoardConstants.ELEMENT.BODY_RIGHT_DOWN
    		|| elements.left == GameBoardConstants.ELEMENT.BODY_RIGHT_UP) {
    		return 'right';
    	} else if (elements.right == GameBoardConstants.ELEMENT.BODY_HORIZONTAL
    		|| elements.right == GameBoardConstants.ELEMENT.TAIL_END_RIGHT 
    		|| elements.right == GameBoardConstants.ELEMENT.BODY_LEFT_DOWN
    		|| elements.right == GameBoardConstants.ELEMENT.BODY_LEFT_UP) {
    		return 'left';
    	}

    	if (elements.above == GameBoardConstants.ELEMENT.TAIL_INACTIVE) {
    		return 'down';
    	} else if (elements.below == GameBoardConstants.ELEMENT.TAIL_INACTIVE) {
    		return 'up';
    	} else if (elements.left == GameBoardConstants.ELEMENT.TAIL_INACTIVE) {
    		return 'right';
    	} else if (elements.right == GameBoardConstants.ELEMENT.TAIL_INACTIVE) {
    		return 'left';
    	}

    	return 'up';

    	// return direction;
	}

	getAllFieldSurround(rotateToHead = false) {
		let surrounds = [];

	    for (let sy = 0; sy < this.size; sy++) {
	        let surroundRow = [];
	        for (let sx = 0; sx < this.size; sx++) {
	            surroundRow.push(this.getElementByXY({x: sx, y: sy }));
	        }
	        surrounds.push(surroundRow);
	    }

	    if (rotateToHead) {
	    	// rotate surround array, so head is always points to the top
	    	// 1st, find angle
	    	let direction = this._playerDirection;
	    	let rotationCount = ArrayHelper.directionStringToRotationCount(direction);
	    	surrounds = ArrayHelper.rotateMatrix(surrounds, rotationCount);
	    }

	    let gameSurround = new GameSurround(surrounds);

	    return gameSurround;

	}

	getSurround(position = null, surroundDepth = 3, rotateToHead = false) {
		position = position || this._playerHeadPosition;

	    let surrounds = [];

	    for (let sy = -surroundDepth; sy < surroundDepth + 1; sy++) {
	        let surroundRow = [];
	        for (let sx = -surroundDepth; sx < surroundDepth + 1; sx++) {
	            surroundRow.push(this.getElementByXY({x: position.x + sx, y: position.y + sy }));
	        }
	        surrounds.push(surroundRow);
	    }

	    if (rotateToHead) {
	    	// rotate surround array, so head is always points to the top
	    	// 1st, find angle
	    	let headPosition = this._playerHeadPosition; 
	    	let direction = this._playerDirection;
	    	let rotationCount = ArrayHelper.directionStringToRotationCount(direction);
	    	
	    	surrounds = ArrayHelper.rotateMatrix(surrounds, rotationCount);
	    }

	    let gameSurround = new GameSurround(surrounds);

	    return gameSurround;
	}

	/**
	 * Mark all cells with 3 walls around as wall
	 * @return {[type]} [description]
	 */
	closeTraps() {
		/// @todo: optimize this
		let closedTrapsCount = 0;
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				if (GameBoardConstants.ELEMENTS.isDeadlyElement(this.getElementByXY({x: x, y: y}))) {
						// this.setElementToXY({x: x, y: y}, GameBoardConstants.ELEMENT.WALL);
				} else {

					let surroundedByDeadlyCount = 0;

					if (GameBoardConstants.ELEMENTS.isDeadlyElement(this.getElementByXY({x: x+1, y: y}))) {
						surroundedByDeadlyCount++;
					}
					if (GameBoardConstants.ELEMENTS.isDeadlyElement(this.getElementByXY({x: x-1, y: y}))) {
						surroundedByDeadlyCount++;
					}
					if (GameBoardConstants.ELEMENTS.isDeadlyElement(this.getElementByXY({x: x, y: y+1}))) {
						surroundedByDeadlyCount++;
					}
					if (GameBoardConstants.ELEMENTS.isDeadlyElement(this.getElementByXY({x: x, y: y-1}))) {
						surroundedByDeadlyCount++;
					}

					if (surroundedByDeadlyCount >= 3) {
						this.setElementToXY({x: x, y: y}, GameBoardConstants.ELEMENT.WALL);
						closedTrapsCount++;
					}
				}

			}
		}

		return closedTrapsCount;
	}

	closeAllTraps() {
		let closedTrapsCount = 0
		do {
			closedTrapsCount = this.closeTraps();
		} while(closedTrapsCount > 0);
	}

	getElementByXY(position) {
	    return this._board[this.size * position.y + position.x];
	}

	setElementToXY(position, element) {
		let i = this.size * position.y + position.x;
		this._board = this._board.substr(0, i) + element + this._board.substr(i + 1);
	}

	isGameOver() {
	    return this._board.indexOf(GameBoardConstants.ELEMENT.HEAD_DEAD) !== -1;
	}

	isGameSleeping() {
	    return this._board.indexOf(GameBoardConstants.ELEMENT.HEAD_SLEEP) !== -1;
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

	getXYByPosition(position) {
	    if (position === -1) {
	        return null;
	    }

	    return {
	        x:  position % this.size,
	        y: (position - (position % this.size)) / this.size
	    };
	}

	getFirstPositionOf(elements) {
	    for (var i = 0; i < elements.length; i++) {
	        var element = elements[i];
	        var position = this._board.indexOf(element);
	        if (position !== -1) {
	            return this.getXYByPosition(position);
	        }
	    }
	    return null;
	}
}

module.exports = GameBoard;