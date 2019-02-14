const expect = require('chai').expect;
const assert = require('chai').assert;

const ArrayHelper = require('../classes/ArrayHelper.js');
const UIHelper = require('../classes/UIHelper.js');
const GameSurround = require('../classes/GameSurround.js');
const GameClient = require('../classes/GameClient.js');
const GameBoardConstants = require('../classes/GameBoardConstants.js');

const GameTargetList = require('../classes/GameTargetList.js');

const path = require('path');

describe('GameTargetList', function() {
	it('initialize ok passing GameBoard', async function() {
		let gc = new GameClient();
		await gc.loadBoardFromFile(path.join(__dirname, 'testlevels/basic.dat'));

		let afSurround = gc.board.allFieldSurround;

		let gameTargetList = new GameTargetList({gameSurround: afSurround});

		//// get list of target elements 
		let onlyApples = gameTargetList.filterTargetsByElement(GameBoardConstants.ELEMENT.APPLE);
		expect(onlyApples.length).to.equal(19); /// there're 19 apples on the field
		for (let i = 0; i < onlyApples.length; i++) {
			expect(onlyApples[i].element).to.equal(GameBoardConstants.ELEMENT.APPLE);
		}

		//// few distance calculations checks
		let playerHeadPosition = afSurround.headPosition;
		let playerTailPosition = afSurround.tailPosition;

		/// empty - path using cells that is not in blockingElement list
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, playerTailPosition, false, 'empty')).to.equal(5);
		/// shortest - path using cells that is not in blockingElement list + weighted from blockingElement list
		/// may be shorted in real distance
		/// 20(player body) + 20(player body) + 1(tail)
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, playerTailPosition, false, 'shortest')).to.equal(21);

		//// best distance is one with lowest value between shortest and empty
		expect(gameTargetList.bestDistanceBetweenPoints(playerHeadPosition, playerTailPosition, false)).to.equal(5);


		let oneCellAhead = {x: afSurround.headPosition.x, y: afSurround.headPosition.y-1}; /// it's an empty cell
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, oneCellAhead)).to.equal(1);
		let twoCellsAhead = {x: afSurround.headPosition.x, y: afSurround.headPosition.y-2}; /// it's an empty cell, just before the wall
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, twoCellsAhead)).to.equal(2);
		let wallAhead = {x: afSurround.headPosition.x, y: afSurround.headPosition.y-3}; /// it's the wall
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, wallAhead)).to.equal(Infinity);

		let appleAheadRight = {x: afSurround.headPosition.x+1, y: afSurround.headPosition.y-2}; /// apple just forward-right
		// console.log(afSurround._matrix[afSurround.headPosition.y-2][afSurround.headPosition.x+1]);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleAheadRight)).to.equal(3);

		let wallAheadLeft = {x: afSurround.headPosition.x-1, y: afSurround.headPosition.y-3}; /// it's the wall
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, wallAheadLeft)).to.equal(Infinity);

		let appleRight = {x: afSurround.headPosition.x+4, y: afSurround.headPosition.y}; /// apple
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleRight)).to.equal(4);

		let stoneAfterAppleRight = {x: afSurround.headPosition.x+5, y: afSurround.headPosition.y}; /// stone right after the apple
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, stoneAfterAppleRight)).to.equal(Infinity); //// we're < 5 in length by default (and on map)

		let appleAfterStoneAfterAppleRight = {x: afSurround.headPosition.x+6, y: afSurround.headPosition.y}; /// there is apple, but path should go above store

		// console.log(afSurround._matrix[afSurround.headPosition.y][afSurround.headPosition.x+6]);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleAfterStoneAfterAppleRight)).to.equal(8);
		// 8 = 7 path items (+) and final apple(○)
		// ☼☼          ●     ║          ☼
		// ☼☼          ○●++++▼          ☼
		// ☼☼     ☼☼☼☼☼+++              ☼
		// ☼☼     ☼☼☼       ○        ○  ☼


		//// try to do same calculations in long state
		gameTargetList.setState('LONG');
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, oneCellAhead)).to.equal(1);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, twoCellsAhead)).to.equal(2);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, wallAhead)).to.equal(Infinity);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleAheadRight)).to.equal(3);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, wallAheadLeft)).to.equal(Infinity);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleRight)).to.equal(4);
		//////// now we can target that stone!
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, stoneAfterAppleRight)).to.equal(5); //// !!!!
		//////// and distance to apple after it is reduced!
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleAfterStoneAfterAppleRight)).to.equal(6); //// !!!!


		////// try to do same calculations in fury state
		gameTargetList.setState('FURY');
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, oneCellAhead)).to.equal(1);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, twoCellsAhead)).to.equal(2);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, wallAhead)).to.equal(Infinity);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleAheadRight)).to.equal(3);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, wallAheadLeft)).to.equal(Infinity);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleRight)).to.equal(4);
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, stoneAfterAppleRight)).to.equal(5); //// !!!!
		expect(gameTargetList.distanceBetweenPoints(playerHeadPosition, appleAfterStoneAfterAppleRight)).to.equal(6); //// !!!!


		//// back to normal state
		gameTargetList.setState('DEFAULT');
		let distancesFromPlayerHead = gameTargetList.calculateDistances(afSurround.headPosition);
		//// the first one in ret array should be the closest target
		expect(distancesFromPlayerHead[0].x).to.equal(appleAheadRight.x);
		expect(distancesFromPlayerHead[0].y).to.equal(appleAheadRight.y);
		//// the second one should be apple to the side
		expect(distancesFromPlayerHead[1].x).to.equal(appleRight.x);
		expect(distancesFromPlayerHead[1].y).to.equal(appleRight.y);
		//// the third one is something, but for sure it's not the stone
		expect(distancesFromPlayerHead[2].x).to.not.equal(stoneAfterAppleRight.x);
		expect(distancesFromPlayerHead[2].y).to.not.equal(stoneAfterAppleRight.y);

		//// get access to distances from GameTargets
		expect(distancesFromPlayerHead[0].getDistanceTo(afSurround.headPosition)).to.equal(3); /// same values we got with distanceBetweenPoints()
		expect(distancesFromPlayerHead[1].getDistanceTo(afSurround.headPosition)).to.equal(4);
		expect(distancesFromPlayerHead[2].getDistanceTo(afSurround.headPosition)).to.not.equal(5); /// it's 6 actually, this is another apple further

		gameTargetList.setState('FIRSTMOVEFURY');
		distancesFromPlayerHead = gameTargetList.calculateDistances(afSurround.headPosition);
		// gameTargetList.log(afSurround.headPosition, null, 9);		
		expect(distancesFromPlayerHead[0].x).to.equal(appleAheadRight.x);
		expect(distancesFromPlayerHead[0].y).to.equal(appleAheadRight.y);
		
		//// get access to distances from GameTargets
		expect(distancesFromPlayerHead[0].getDistanceTo(afSurround.headPosition)).to.equal(3); /// same values we got with distanceBetweenPoints()
		
		gameTargetList.setState('LONG');
		distancesFromPlayerHead = gameTargetList.calculateDistances(afSurround.headPosition);
		//// but it IS that stone if we are long enough to eat it
		expect(distancesFromPlayerHead[2].x).to.equal(stoneAfterAppleRight.x);
		expect(distancesFromPlayerHead[2].y).to.equal(stoneAfterAppleRight.y);

		//// get access to distances from GameTargets
		expect(distancesFromPlayerHead[0].getDistanceTo(afSurround.headPosition)).to.equal(3); /// same values we got with distanceBetweenPoints()
		expect(distancesFromPlayerHead[1].getDistanceTo(afSurround.headPosition)).to.equal(4);
		expect(distancesFromPlayerHead[2].getDistanceTo(afSurround.headPosition)).to.equal(5);

		//// now check target sorting. Just by rating first
		let sortTargetFunction = function(params) {
			let target = params.target;
			let distance = params.distance;
			let rating = target.rating;

			return -rating;
		};
		let distancesFromPlayerHeadWithRatingUsing = gameTargetList.calculateDistances(afSurround.headPosition, sortTargetFunction);


		// for (let i = 0; i < distancesFromPlayerHeadWithRatingUsing.length; i++) {
		// 	console.log(distancesFromPlayerHeadWithRatingUsing[i].element);
		// }

		// gameTargetList.log(afSurround.headPosition, sortTargetFunction);

		/// there re 2 fury pills, they should have maximum priority
		expect(distancesFromPlayerHeadWithRatingUsing[0].element).to.equal(GameBoardConstants.ELEMENT.FURY_PILL);
		expect(distancesFromPlayerHeadWithRatingUsing[1].element).to.equal(GameBoardConstants.ELEMENT.FURY_PILL);
		//// next few are golds
		expect(distancesFromPlayerHeadWithRatingUsing[2].element).to.equal(GameBoardConstants.ELEMENT.GOLD);
		//// and lowest priorities are for apples
		expect(distancesFromPlayerHeadWithRatingUsing[distancesFromPlayerHeadWithRatingUsing.length - 1].element).to.equal(GameBoardConstants.ELEMENT.APPLE);
		expect(distancesFromPlayerHeadWithRatingUsing[distancesFromPlayerHeadWithRatingUsing.length - 2].element).to.equal(GameBoardConstants.ELEMENT.APPLE);

		//// now sort by combining rating and distance
		sortTargetFunction = function(params) {
			let target = params.target;
			let distance = params.distance;
			let rating = target.rating;

			return distance-rating;
		};

		let distancesFromPlayerHeadWithRatingDistanceUsing = gameTargetList.calculateDistances(afSurround.headPosition, sortTargetFunction);
		/// one furry pill is relatively close, while other one is very far away, so we have to concentrate only on one of it
		expect(distancesFromPlayerHeadWithRatingDistanceUsing[0].element).to.equal(GameBoardConstants.ELEMENT.FURY_PILL);
		expect(distancesFromPlayerHeadWithRatingDistanceUsing[1].element).to.not.equal(GameBoardConstants.ELEMENT.FURY_PILL);

		// console.log(11);


		// console.log(distancesFromPlayerHead);
		// dasd;




		// console.log(distancesFromPlayerHead);
		// functionsd;

	});



});