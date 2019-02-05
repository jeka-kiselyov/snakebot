const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');
const ArrayHelper = require('./ArrayHelper.js');

const GameTarget = require('./GameTarget.js');

class GameTargetList { 
	constructor(params = {}) {
		this._gameSurround = params.gameSurround || null;

		this._targetElements = params.targetElements || GameBoardConstants.ELEMENTRATINGS.defaultTargetElements();
		this._blockingElements = params.blockingElements || GameBoardConstants.ELEMENTRATINGS.defaultBlockingElements();

		this._targets = [];
		this._toCoordinatesDistances = {};
	}

	log(fromPosition, sortFunction, showMax = 5) {
		let array = [];
		array.push(['from:', 'x:'+fromPosition.x, 'y:'+fromPosition.y, 'd:', 'r:']);

		let targets = this.calculateDistances(fromPosition, sortFunction);
		for (let i = 0; (i < targets.length && i < showMax); i++) {
			array.push([targets[i].element, targets[i].x, targets[i].y, targets[i].getDistanceTo(fromPosition), targets[i].rating]);
		}

		UIHelper.logTwoDimArray(array);	
	}

	setState(state) {
		switch (state) {
			case 'FIRSTMOVEFURY':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.firstMoveFuryTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.firstMoveFuryBlockingElements();

				break;
			case 'FURY':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.furyTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.furyBlockingElements();

				break;
			case 'LONG':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.longTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.longBlockingElements();

				break;
			case 'DEFAULT':
			default:
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.defaultTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.defaultBlockingElements();

				break;
		};

		this._targets = [];
		this._toCoordinatesDistances = {};
	}

	get matrix() {
		return this._gameSurround._matrix;
	}

	get width() {
		return this._gameSurround.width;
	}

	get height() {
		return this._gameSurround.height;
	}

	get gameSurround() {
		return this._gameSurround;
	}

	get targets() {
		if (!this._targets.length) {
			this.fillTargets();
		}

		return this._targets;
	}

	filterTargetsByElement(element) {
		if (!this._targets.length) {
			this.fillTargets();
		}
		
		return this._targets.filter(gameTarget => gameTarget.element == element);
	}

	get blockingElements() {
		return this._blockingElements;
	}

	get targetElements() {
		return this._targetElements;
	}

	fillTargets() {
		this._targets = [];
		this._toCoordinatesDistances = {};

        for (let x = 0; x < this.gameSurround.width; x++) {
        	for (let y = 0; y < this.gameSurround.height; y++) {
        		if (this.gameSurround._matrix[y][x] in this.targetElements) {
        			let gameTarget = new GameTarget({
        				x: x,
        				y: y,
        				element: this.gameSurround._matrix[y][x],
        				rating: this.targetElements[this.gameSurround._matrix[y][x]],
        				gameTargetList: this
        			});
        			this._targets.push(gameTarget);
        		}
    		}
    	}
	}

	calculateDistances(fromPosition, sortFunction, includeInitialCellDistance = false) {
		if ((fromPosition.x < 0 || fromPosition.y < 0 || fromPosition.x >= this.width || fromPosition.y >= this.height)) {
			return false;
		}

		if (!this._targets.length) {
			this.fillTargets();
		}

		let ret = [];

		let distancesObject = [];
		for (let i = 0; i < this._targets.length; i++) {
			let distance = this.distanceBetweenPoints(fromPosition, this._targets[i], includeInitialCellDistance);
			this._targets[i].setDistanceTo(fromPosition, distance);
			distancesObject.push(distance);

			ret.push(this._targets[i]);
		}

		if (typeof(sortFunction) != 'function') {
			sortFunction = function(params) {
				let target = params.target;
				let distance = params.distance;
				return distance;
			};
		}

		///// sort return array by distance to position
		ret = ret.sort(function(a, b){
			a = sortFunction({target: a, distance: a.getDistanceTo(fromPosition)});
			b = sortFunction({target: b, distance: b.getDistanceTo(fromPosition)});
			return a == b ? 0 : +(a > b) || -1;
		});

		// this._toCoordinatesDistances[''+fromPosition.x+'_'+fromPosition.y] = distancesObject;
		return ret;
	}

	distanceBetweenPoints(position1, position2, includeInitialCellDistance = false) {
		if ((position1.x < 0 || position1.y < 0 || position1.x >= this.width || position1.y >= this.height) ||
			(position2.x < 0 || position2.y < 0 || position2.x >= this.width || position2.y >= this.height)) {
			return Infinity;
		}

		let shiftX = [-1, 0, 0, 1]; /// shifts
		let shiftY = [0, -1, 1, 0]; 

		let visited = Array(this.width).fill(false).map(() => {return Array(this.height).fill(false)});
		let queue = [];

		visited[position1.y][position1.x] = true;
		let initialDistance = 0;
		if (this._blockingElements[this.matrix[position1.y][position1.x]] && includeInitialCellDistance) {
			initialDistance = this._blockingElements[this.matrix[position1.y][position1.x]];
		}
		
		queue.push({x: position1.x, y: position1.y, distance: initialDistance});

		while(queue.length) {
			let last = queue.shift();
			// console.log('last x:'+last.x+' last y:'+last.y+'   in search of x:'+position2.x+' y:'+position2.y+'  -- '+this.matrix[position2.y][position2.x]);

			if (last.x == position2.x && last.y == position2.y) {
				return last.distance;
			}

	        for (let i = 0; i < 4; i++) 
	        {
	        	let x = last.x + shiftX[i];
	        	let y = last.y + shiftY[i];
	        	if ( (x >= 0 && y >= 0 && x < this.width && y < this.height) &&
	        		 !visited[y][x] ) {

	        		let thisCellDistance = (this._blockingElements[this.matrix[y][x]] ? this._blockingElements[this.matrix[y][x]] : 1);

	        		// console.log(queue);
		        	// console.log('CD: '+this.matrix[y][x]+' - '+thisCellDistance);

		        	if (x == position2.x && y == position2.y && thisCellDistance != Infinity) {
		        		return last.distance + thisCellDistance;
		        	}

		        	if (thisCellDistance != Infinity) {
			        	visited[y][x] = true;
		        		queue.push({x: x, y: y, distance: last.distance + thisCellDistance});
		        	}
	        	}
	        }
		}

		return Infinity;
	}
}

module.exports = GameTargetList;