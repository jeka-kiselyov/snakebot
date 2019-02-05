const {Program,Command,LovaClass} = require('lovacli');

class ArrayHelper { 
	constructor() {
	}

	/**
	 * Rotate matrix clockwise
	 * @param  {[type]} matrix         [description]
	 * @param  {Number} rotationCount [description]
	 * @return {[type]}               [description]
	 */
	static rotateMatrix(matrix, rotationCount = 1) {
		if (rotationCount == 0) {
			return matrix;
		}
		if (rotationCount == 1) {
		    let result = [];
		    for(let i = 0; i < matrix[0].length; i++) {
		        let row = matrix.map(e => e[i]).reverse();
		        result.push(row);
		    }
		    return result;
		} else {
			let ret = matrix;
			for (let i = 0; i < rotationCount; i++) {
				ret = ArrayHelper.rotateMatrix(ret);
			}

			return ret;
		}
	}

	static directionStringToRotationCount(direction) {
		let counts = {
			'up': 0,
			'right': 3,
			'down': 2,
			'left': 1
		};

		// return 1;

		return counts[direction] ? counts[direction] : 0;
	}

}

module.exports = ArrayHelper;