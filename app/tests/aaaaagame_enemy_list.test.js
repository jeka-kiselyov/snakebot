const expect = require('chai').expect;
const assert = require('chai').assert;

const ArrayHelper = require('../classes/ArrayHelper.js');
const UIHelper = require('../classes/UIHelper.js');
const GameSurround = require('../classes/GameSurround.js');
const GameClient = require('../classes/GameClient.js');
const GameBoardConstants = require('../classes/GameBoardConstants.js');

const EnemyList = require('../classes/EnemyList.js');
const Enemy = require('../classes/Enemy.js');

const path = require('path');

describe('EnemyList', function() {
	it('initialize ok passing GameBoard', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'testlevels/few_enemies.dat'));

		let afSurround = gc.board.allFieldSurround;

		let enemyList = new EnemyList({gameSurround: afSurround});

		//// all, dead + sleeping
		expect(enemyList.enemies.length).to.equal(8);

		let defaultOnly = enemyList.filterEnemies([Enemy.STATE.DEFAULT]);

		/// default
		expect(defaultOnly.length).to.equal(4);

		let furyOnly = enemyList.filterEnemies([Enemy.STATE.FURY]);

		/// fury
		expect(furyOnly.length).to.equal(1);

		let notDead = enemyList.filterEnemies([Enemy.STATE.FURY, Enemy.STATE.DEFAULT, Enemy.STATE.LONG, Enemy.STATE.FLY]);

		/// not dead
		expect(notDead.length).to.equal(5);

		//// enemy has length calculated
		expect(furyOnly[0].length).to.equal(9);

		expect(furyOnly[0].isFury()).to.equal(true);
		expect(furyOnly[0].isActive()).to.equal(true);


		////// next move position of enemies. Usually, there're 3 possible cells to go, but if there's wall or something - there is less
		expect(furyOnly[0].nextMovePositions.length).to.equal(3);

		///// there's at least one enemy with only 2 cells to go
		let found2 = false;
		for (let enemy of enemyList.enemies) {
			if (enemy.nextMovePositions.length == 2) {
				found2 = true;
			}
		}

		expect(found2).to.equal(true);

		//// and there's one with only one possible move direction (in the corner of the field)
		let found1 = false;
		for (let enemy of enemyList.enemies) {
			if (enemy.nextMovePositions.length == 1) {
				found1 = true;
			}
		}

		expect(found1).to.equal(true);

		let closestTargetToFuryOne = furyOnly[0].getClosestTarget();

		// console.log(furyOnly[0].possiblePaths);


		// expect(found1).to.equal('234');
	});



});