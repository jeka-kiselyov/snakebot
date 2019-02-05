const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');
const ArrayHelper = require('./ArrayHelper.js');

class GameVector { 
	constructor(vector = []) {
		this._vector = vector;
		this._length = vector.length;
	}

	get length() {
		return this._length;
	}

	log() {
		UIHelper.logTwoDimArray([this._vector]);
	}

	getRating(targetElements = {}, blockingElements = {}) {
		let rating = 0;
		
		for (let i = 0; i < this.length; i++) {
			let cellRating = 0;
			let cellDistanceK = Math.pow(0.9, i); // 1, 0.9, 0.81 ....

			if (this._vector[i] in targetElements) {
				cellRating = targetElements[this._vector[i]];
			}
			if (this._vector[i] in blockingElements) {
				rating -= (cellDistanceK * 0.1);
				break;
			}

			rating += cellRating * cellDistanceK;
		}

		if (this.length > 0 && (this._vector[0] in blockingElements)) {
			rating = -blockingElements[this._vector[0]];
		}

		return rating;
	}
}

module.exports = GameVector;