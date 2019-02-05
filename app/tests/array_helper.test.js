const expect = require('chai').expect;
const assert = require('chai').assert;

const ArrayHelper = require('../classes/ArrayHelper.js');
const UIHelper = require('../classes/UIHelper.js');

describe('Array helper', function() {
	it('rotates array like a boss', async function() {
		let dx = 4;
		let dy = 3;
		let sampleMatrix = [
			[0,1,3,0],
			[3,4,5,0],
			[6,7,8,0]
		];

		expect(sampleMatrix.length).to.equal(dy);
		expect(sampleMatrix[0].length).to.equal(dx);

		let rotated = ArrayHelper.rotateMatrix(sampleMatrix);

		UIHelper.logTwoDimArray(sampleMatrix);
		UIHelper.logTwoDimArray(rotated);

		expect(rotated.length).to.equal(dx);
		expect(rotated[0].length).to.equal(dy);

		/// rotated 4 times should be the same as original
		let rotated4 = ArrayHelper.rotateMatrix(sampleMatrix, 4);

		expect(rotated4.length).to.equal(dy);
		expect(rotated4[0].length).to.equal(dx);

		for (let i = 0; i < rotated4.length; i++) {
			for (let j = 0; j < rotated4.length; j++) {
				expect(rotated4[i][j]).to.equal(sampleMatrix[i][j]);
			}
		}

		// UIHelper.logTwoDimArray(sampleMatrix);
		// UIHelper.logTwoDimArray(rotated4);
	});
});