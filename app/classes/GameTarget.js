const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');
const ArrayHelper = require('./ArrayHelper.js');

class GameTarget { 
	constructor(params = {}) {
		this._x = params.x || 0;
		this._y = params.y || 0;
		this._element = params.element || GameBoardConstants.ELEMENT.WALL;

		this._gameTargetList = params.gameTargetList || null;

		this._distancesTo = {};
		this._weightedDistancesTo = {};

		this._pessimizationK = 0;
	}

	pessimize(byValue) {
		this._pessimizationK += byValue;
	}

	prioritize(byValue) {
		this._pessimizationK -= byValue;
	}

	get element() {
		return this._element;
	}

	get pessimizationK() {
		return this._pessimizationK || 0;
	}

	get rating() {
		if (this._element in this._gameTargetList.targetElements) {
			return this._gameTargetList.targetElements[this._element];
		} else if (this._element in this._gameTargetList.blockingElements) {
			return -this._gameTargetList.blockingElements[this._element];
		}
		return 0;
	}

	getDistanceTo(point, weighted = false) {
		let x = point.x || 0;
		let y = point.y || 0;
		let key = 'd_'+x+'-'+y;

		if (weighted) {
			if (key in this._weightedDistancesTo) {
				return this._weightedDistancesTo[key];
			} else {
				this._weightedDistancesTo[key] = this._gameTargetList.distanceBetweenPoints({x: x, y: y}, {x: this.x, y: this.y});
				return this._weightedDistancesTo[key];
			}		
		} else {
			if (key in this._distancesTo) {
				return this._distancesTo[key];
			} else {
				this._distancesTo[key] = this._gameTargetList.distanceBetweenPoints({x: x, y: y}, {x: this.x, y: this.y});
				return this._distancesTo[key];
			}			
		}
	}

	setDistanceTo(point, distance, weighted = false) {
		let x = point.x || 0;
		let y = point.y || 0;
		let key = 'd_'+x+'-'+y;

		if (weighted) {
			this._weightedDistancesTo[key] = distance;
		} else {
			this._distancesTo[key] = distance;			
		}
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}
}

module.exports = GameTarget;