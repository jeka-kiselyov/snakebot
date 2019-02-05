const {Program,Command,LovaClass} = require('lovacli');
var Table = require('cli-table3');

class UIHelper { 
	constructor() {
	}

	static logTwoDimArray(array) {
		var table = new Table({
		});

		for (let i = 0; i < array.length; i++) {
			table.push(array[i]);
		}

		console.log(table.toString());
	}
}

module.exports = UIHelper;