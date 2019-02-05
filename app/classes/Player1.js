const {Program,Command,LovaClass} = require('lovacli');

const GameBoardConstants = require('./GameBoardConstants.js');
const UIHelper = require('./UIHelper.js');

class Player1 extends LovaClass { /// EventEmmiter
	constructor() {
		super();

		this._board = null;
		this._bestMoves = {
			FORWARD: 0,
			LEFTWARD: 0,
			RIGHTWARD: 0,
			ACTION: 0
		};

		this._command = null;
	}

	get command() {
		return this._command;
	}

	get bestMove() {
		let max = -Infinity;
		let maxK = 'FORWARD';
		for (let k in this._bestMoves) {
			if (k != 'ACTION' && this._bestMoves[k] > max) {
				maxK = k;
				max = this._bestMoves[k];
			}
		}

		return maxK;
	}

	flushBestMoves() {
		this._bestMoves = {
			FORWARD: 1,
			LEFTWARD: 1,
			RIGHTWARD: 1,
			ACTION: 0
		};		
	}

	lookAtBoard(board, previousBoards = []) {
		this._command = null;
		this._board = board;
		this.flushBestMoves();

		let features = {
			VECTOR_FORWARD_RATING: 0,
			VECTOR_LEFTWARD_RATING: 0,
			VECTOR_RIGHTWARD_RATING: 0,
			CLOSEST_FORWARD_RATING: 0,
			CLOSEST_LEFTWARD_RATING: 0,
			CLOSEST_RIGHTWARD_RATING: 0,
			NEED_TO_ACT: 0
		};
		let bestMoves = {
			FORWARD: 1,
			LEFTWARD: 1,
			RIGHTWARD: 1,
			ACTION: 0
		};



		/// 1st. Calculate features
		let afSurround = this._board.allFieldSurround;

		let playerSnakeLengthOnTheNextMove = afSurround.playerSnakeLength;
		//// determine if we eat rock on the prev move
		if (previousBoards && previousBoards.length) {
			if (previousBoards[previousBoards.length - 1].getElementByXY(this._board.playerHeadPosition) == GameBoardConstants.ELEMENT.STONE) {
				console.log('EAT ROCK ON PREV MOVE');
				playerSnakeLengthOnTheNextMove = playerSnakeLengthOnTheNextMove - 3;
			}
		}

		let isFuryOnTheNextMove = false;
		let expectedFuryMoves = 0;
		if (afSurround.isPlayerFury()) {
			console.log('F');
			/// check if was furry on prev 9 moves
			let wasNotFury = false;
			if (previousBoards && previousBoards.length >= 9) {
				expectedFuryMoves = 9;
				for (let i = 0; i < 9; i++) {
					if (!previousBoards[previousBoards.length - 1 - i].allFieldSurround.isPlayerFury()) {
						wasNotFury = true;
						console.log('N');
					} else {
						expectedFuryMoves--;
						console.log('F');
					}
				}
			} else {
				wasNotFury = true;
			}

			if (wasNotFury) {
				isFuryOnTheNextMove = true;
			}
		}



		/// 1.1 Expected state on the next move
		let expectedNextMoveState = 'DEFAULT';
		if (isFuryOnTheNextMove) {
			if (expectedFuryMoves >= 9) {
				expectedNextMoveState = 'FIRSTMOVEFURY';
			} else {
				expectedNextMoveState = 'FURY';				
			}
		} else if (playerSnakeLengthOnTheNextMove >= 5) {
			expectedNextMoveState = 'LONG';			
		}

		console.log('NEXT MOVE STATE: '+expectedNextMoveState);

		/// !!!!
		afSurround.targetList.setState(expectedNextMoveState);


		/// 1.2 Surround area vectors
		let surroundDepth = 3;
		let gameSurround = this._board.getSurround(null, surroundDepth, true); /// +-3 cells, from player position

		gameSurround.log();

		features.VECTOR_LEFTWARD_RATING = gameSurround.vectors.leftward.getRating(afSurround.targetList.targetElements, afSurround.targetList.blockingElements);
		features.VECTOR_FORWARD_RATING = gameSurround.vectors.forward.getRating(afSurround.targetList.targetElements, afSurround.targetList.blockingElements);
		features.VECTOR_RIGHTWARD_RATING = gameSurround.vectors.rightward.getRating(afSurround.targetList.targetElements, afSurround.targetList.blockingElements);

		/// 1.3 Ratings of possible next move positions
		let nextMovePositions = {
			forward: {x: afSurround.headPosition.x, y: afSurround.headPosition.y - 1},
			left: {x: afSurround.headPosition.x - 1, y: afSurround.headPosition.y},
			right: {x: afSurround.headPosition.x + 1, y: afSurround.headPosition.y}
		};


		let targetSortFunction = function(params) {
			let target = params.target;
			let distance = params.distance;
			let rating = target.rating;

			return distance-rating;
		};

		let nextMoveClosestTargets = {
			forward: afSurround.targetList.calculateDistances(nextMovePositions.forward, targetSortFunction, true),
			left: afSurround.targetList.calculateDistances(nextMovePositions.left, targetSortFunction, true),
			right: afSurround.targetList.calculateDistances(nextMovePositions.right, targetSortFunction, true)
		};

		let fromHeadTargets = afSurround.targetList.calculateDistances(afSurround.headPosition, targetSortFunction);
		
		let closestDistanceToBestTarget = {
			forward: nextMoveClosestTargets.forward.length ? nextMoveClosestTargets.forward[0].getDistanceTo(nextMovePositions.forward) : Infinity,
			left: nextMoveClosestTargets.left.length ? nextMoveClosestTargets.left[0].getDistanceTo(nextMovePositions.left) : Infinity,
			right: nextMoveClosestTargets.right.length ? nextMoveClosestTargets.right[0].getDistanceTo(nextMovePositions.right) : Infinity
		};


		features.CLOSEST_FORWARD_RATING = (60 / Math.min(60, closestDistanceToBestTarget.forward)); // attempt to normalize
		features.CLOSEST_LEFTWARD_RATING = (60 / Math.min(60, closestDistanceToBestTarget.left)); // attempt to normalize
		features.CLOSEST_RIGHTWARD_RATING = (60 / Math.min(60, closestDistanceToBestTarget.right)); // attempt to normalize

		// console.log(afSurround.distanceBetweenPoints(afSurround.headPosition, {x: afSurround.headPosition.x, y: afSurround.headPosition.y+1}));
		// console.log(afSurround.distanceBetweenPoints(afSurround.headPosition, {x: afSurround.headPosition.x-1, y: afSurround.headPosition.y}));
		// console.log(afSurround.distanceBetweenPoints(afSurround.headPosition, {x: afSurround.headPosition.x+1, y: afSurround.headPosition.y}));


		let applyKToMaxFeaturesFromSet = function(featureNames, k) {
			let maxV = -Infinity;
			let maxFeatureName = null;

			for (let i = 0; i < featureNames.length; i++) {
				if (features[featureNames[i]] > maxV) {
					maxV = features[featureNames[i]];
					maxFeatureName = featureNames[i];
				}
			}

			let moveNames = ['FORWARD', 'LEFTWARD', 'RIGHTWARD'];
			for (let i = 0; i < featureNames.length; i++) {
				if (features[featureNames[i]] == maxV) {
					for (let j = 0; j < moveNames.length; j++) {
						if (featureNames[i].indexOf(moveNames[j]) != -1) {
							bestMoves[moveNames[j]] *= k;
						}
					}
				}
			}
		}


		afSurround.targetList.log(afSurround.headPosition, targetSortFunction);

		//// 1.4 find out if we can drop the stone!

		//// determine distance to player's tail. If it's > than distance to closest target - DO NOT ACT
		let distanceBetweenHeadAndTail = afSurround.targetList.distanceBetweenPoints(afSurround.headPosition, afSurround.tailPosition);
		console.log('Distance between head and tail: '+distanceBetweenHeadAndTail);

		if (isFuryOnTheNextMove) {
			console.log('Expected fury moves: '+expectedFuryMoves+'  head2tail distance: '+distanceBetweenHeadAndTail);
			if (playerSnakeLengthOnTheNextMove < expectedFuryMoves - 2) {
				features.NEED_TO_ACT = 1;
			}
		} else {
			/// if we are just long
			/// there're no fury pills on the field
			/// and no close distance target
			/// ---- drop the stone
			let furyPills = afSurround.targetList.filterTargetsByElement(GameBoardConstants.ELEMENT.FURY_PILL);

			if (!furyPills.length && fromHeadTargets.length && distanceBetweenHeadAndTail < fromHeadTargets[0].getDistanceTo(afSurround.headPosition) - 2) {
				if (playerSnakeLengthOnTheNextMove >= 5) {
					features.NEED_TO_ACT = 1;
				}
				console.log('TAIL IS CLOSER');
			} else {
				console.log('TAIL IS FARer');
			}			
		}


		applyKToMaxFeaturesFromSet(['VECTOR_LEFTWARD_RATING','VECTOR_FORWARD_RATING','VECTOR_RIGHTWARD_RATING'], 2);
		applyKToMaxFeaturesFromSet(['CLOSEST_LEFTWARD_RATING','CLOSEST_FORWARD_RATING','CLOSEST_RIGHTWARD_RATING'], 2.1);

		if (features.NEED_TO_ACT) {
			bestMoves['ACTION'] = 10;			
		}

		this._bestMoves = bestMoves;

		console.log(features);
		console.log(this._bestMoves);

        this._command = this._board.moveToCommand(this.bestMove);
        if (this._bestMoves.ACTION > 0) {
        	if (this._command) {
	        	this._command = this._command+',ACT';
        	} else {
        		this._command = 'ACT';
        	}
        }
	}

}

module.exports = Player1;