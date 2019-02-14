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

		this._stateName = 'DEFAULT';
		this._extraStateName = 'NOTHING';

		this._settings = {};
	}

	log(fromPosition, sortFunction, showMax = 5) {
		let array = [];
		array.push(['from:', 'x:'+fromPosition.x, 'y:'+fromPosition.y, 'd:', 'r:', 'pess:']);

		let targets = this.calculateDistances(fromPosition, sortFunction);
		for (let i = 0; (i < targets.length && i < showMax); i++) {
			array.push([targets[i].element, targets[i].x, targets[i].y, targets[i].getDistanceTo(fromPosition), targets[i].rating, targets[i].pessimizationK]);
		}

		UIHelper.logTwoDimArray(array);	
	}

	updateStateWithSettings(settings) {
		this._settings = settings;

		// console.log(this._stateName);
		if (this._settings) {
			if (this._settings.elementsRatings && this._settings.elementsRatings[this._stateName]) {
				let elementsRatings = this._settings.elementsRatings[this._stateName];
				let targetElements = {};
				for (let k in elementsRatings) {
					if ((GameBoardConstants.ELEMENT[k])) {
						/// direct element
						targetElements[GameBoardConstants.ELEMENT[k]] = elementsRatings[k];
					} else {
						/// probably it's tag
						if (GameBoardConstants.TAGS[k]) {
							for (let eName of GameBoardConstants.TAGS[k]) {
								targetElements[GameBoardConstants.ELEMENT[eName]] = elementsRatings[k];
							}
						}
					}
				}


				// console.log('Updating targetElements by this._settings'); 
				// console.log(targetElements);
				this._targetElements = targetElements;
				// console.log(targetElements);
				// fdf;
			} 
			if (this._settings.blockingElements && this._settings.blockingElements[this._stateName]) {
				let blockingElementsRatings = this._settings.blockingElements[this._stateName];
				let blockingElements = {};
				for (let k in blockingElementsRatings) {
					if ((GameBoardConstants.ELEMENT[k])) {
						/// direct element
						blockingElements[GameBoardConstants.ELEMENT[k]] = blockingElementsRatings[k];
					} else {
						/// probably it's tag
						if (GameBoardConstants.TAGS[k]) {
							for (let eName of GameBoardConstants.TAGS[k]) {
								blockingElements[GameBoardConstants.ELEMENT[eName]] = blockingElementsRatings[k];
							}
						}
					}
				}


				console.log('Updating blockingElements by this._settings'); 
				// console.log(blockingElements);
				this._blockingElements = blockingElements;
				// console.log(targetElements);
				// fdf;
			} 
		}

		this.removeTargetsFromBlocking();
	}

	removeTargetsFromBlocking() {
		for (let k of Object.keys(this._targetElements)) {
			delete this._blockingElements[k];
		}
	}

	setExtraState(extraStateName) {
		this._extraStateName = extraStateName;
		// console.log(this._settings.extraStates[extraStateName]); dasd;
		if (this._settings) {
			if (this._settings.extraStates && this._settings.extraStates[this._extraStateName]) {
				let extraStateSettings = this._settings.extraStates[this._extraStateName];
				for (let k of Object.keys(extraStateSettings.targets)) {
					if ((GameBoardConstants.ELEMENT[k])) {
						/// direct element
						this._targetElements[GameBoardConstants.ELEMENT[k]] = extraStateSettings.targets[k];
					} else {
						/// probably it's tag
						if (GameBoardConstants.TAGS[k]) {
							for (let eName of GameBoardConstants.TAGS[k]) {
								this._targetElements[GameBoardConstants.ELEMENT[eName]] = extraStateSettings.targets[k];
							}
						}
					}
				}
				for (let k of Object.keys(extraStateSettings.blocking)) {
					if ((GameBoardConstants.ELEMENT[k])) {
						/// direct element
						this._blockingElements[GameBoardConstants.ELEMENT[k]] = extraStateSettings.blocking[k];
					} else {
						/// probably it's tag
						if (GameBoardConstants.TAGS[k]) {
							for (let eName of GameBoardConstants.TAGS[k]) {
								this._blockingElements[GameBoardConstants.ELEMENT[eName]] = extraStateSettings.blocking[k];
							}
						}
					}
				}
			}
		}

		this.removeTargetsFromBlocking();

	}

	setState(state) {
		switch (state) {
			case 'ENEMYFURY':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.enemyFuryTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.enemyDefaultBlockingElements();

				break;
			case 'ENEMYLONG':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.enemyLongTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.enemyDefaultBlockingElements();

				break;
			case 'ENEMYDEFAULT':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.enemyDefaultTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.enemyDefaultBlockingElements();

				break;
			case 'FIRSTMOVEFURY':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.firstMoveFuryTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.firstMoveFuryBlockingElements();

				break;
			case 'FURY':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.furyTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.furyBlockingElements();

				break;
			case 'LONG':
			case 'LONGEST':
			case 'LONGESTPLUS3':
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.longTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.longBlockingElements();

				break;
			case 'DEFAULT':
			default:
				this._targetElements = GameBoardConstants.ELEMENTRATINGS.defaultTargetElements();
				this._blockingElements = GameBoardConstants.ELEMENTRATINGS.defaultBlockingElements();

				break;
		};

		this._stateName = state;
		this._targets = [];
		this._toCoordinatesDistances = {};
		
		this.removeTargetsFromBlocking();
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

	targetByCoordinates(coordinates) {
		for (let target of this.targets) {
			if (target.x == coordinates.x && target.y == coordinates.y) {
				return target;
			}
		}

		return null;
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
			let distance = this.bestDistanceBetweenPoints(fromPosition, this._targets[i], includeInitialCellDistance);

			if (this._targets[i].element == '╓') {
				console.log(distance);
			}

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

	bestDistanceBetweenPoints(position1, position2, includeInitialCellDistance = false) {
		let distanceEmpty = this.distanceBetweenPoints(position1, position2, includeInitialCellDistance, 'empty');
		let distanceShortest = this.distanceBetweenPoints(position1, position2, includeInitialCellDistance, 'shortest');
		return Math.min(distanceEmpty, distanceShortest);
	}

	distanceBetweenPoints(position1, position2, includeInitialCellDistance = false, betterPath = 'empty') {
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


		        	if ((betterPath == 'shortest' && thisCellDistance != Infinity) || (betterPath == 'empty' && thisCellDistance == 1)) {
		        		if (x == position2.x && y == position2.y) {
			        		return last.distance + thisCellDistance;
			        	}

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