const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');
const ArrayHelper = require('./ArrayHelper.js');

class Path { 
	constructor(params = {}) {
		this._from = params.from || null;
		this._to = params.to || null;
		this._distance = params.distance || null;
		this._target = params.target || null;
	}

	get target() {
		return this._target;
	}

	get from() {
		return this._from;
	}

	get to() {
		return this._to;
	}

	get distance() {
		return this._distance;
	}

	toString() {
		return 'from: (x: '+this._from.x+' y: '+this._from.y+') to: (x: '+this._to.x+' y: '+this._to.y+') "'+this.target.element+'" d: '+this.distance; 
	}
}

module.exports = Path;