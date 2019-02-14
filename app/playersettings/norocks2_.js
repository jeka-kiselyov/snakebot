const GameBoardConstants = require('../classes/GameBoardConstants.js');

const settings = {
	specials: {
		dropTheRockIfTheresNoTargetNearThan: 30,
		dropTheRockIfLengthMoreThan: 10,
		markNCellAsDangerousAroundLongerEnemy: 0
	},
	extraStates: {
		killNearest: {
			targets: {
				ENEMY_HEAD_ONE_POINT_FROM_PLAYER: 1000
			},
			blocking: {
				ENEMY_HEAD_ONE_POINT_FROM_PLAYER: 1
			}
		}
	},
	elementsRatings: {
		DEFAULT: {
			GOLD: 10,
			APPLE: 1,
			STONE: -200,
			FURY_PILL: 20,
			PLAYERTAIL: -200,
			ENEMY_HEAD_ONE_POINT_FROM_PLAYER: -Infinity
		},
		FURY: {
			GOLD: 10,
			APPLE: 0.2,
			STONE: 3,
			FURY_PILL: 3,
			PLAYERTAIL: 2,
			ENEMY_HEAD_ONE_POINT_FROM_PLAYER: 1000
		},
		LONG: {
			GOLD: 10,
			APPLE: 1,
			STONE: -1000,
			FURY_PILL: 20,
			ENEMY_HEAD_ONE_POINT_FROM_PLAYER: -Infinity // -Infinity /// need to re-calculate this based on player-enemy length
		},
		LONGEST: {
			GOLD: 10,
			APPLE: 1,
			STONE: -100,
			FURY_PILL: 20,
			ENEMY_HEAD_ONE_POINT_FROM_PLAYER: -Infinity		
		},
		LONGESTPLUS3: {
			GOLD: 10,
			APPLE: 1,
			STONE: 3,
			FURY_PILL: 20,
			ENEMY_HEAD_ONE_POINT_FROM_PLAYER: -Infinity			
		}
	},
	blockingElements: {
		DEFAULT: {
			STONE: Infinity,
			WALL: Infinity,
			START_FLOOR: Infinity,
			OTHER: Infinity,
			ENEMY_TAIL_INACTIVE: Infinity,
			ENEMY_HEAD_EVIL: Infinity,
			ENEMY_HEAD_SLEEP: Infinity,

			ENEMYNORMALHEAD: Infinity,
			ENEMYBODY: Infinity,

			ENEMY_HEAD_ONE_POINT_FROM_PLAYER: Infinity,

			HEAD_DOWN: Infinity,
			HEAD_LEFT: Infinity,
			HEAD_RIGHT: Infinity,
			HEAD_UP: Infinity,
			HEAD_DEAD: Infinity,
			HEAD_EVIL: Infinity,
			HEAD_FLY: Infinity,
			HEAD_SLEEP: Infinity,

	        BODY_HORIZONTAL: 30,
	        BODY_VERTICAL: 30,
	        BODY_LEFT_DOWN: 30,
	        BODY_LEFT_UP: 30,
	        BODY_RIGHT_DOWN: 30,
	        BODY_RIGHT_UP: 30
		}
	}
};
console.log(settings);
module.exports = settings;


// module.exports.TAGS = {
//     PLAYERTAIL: ['TAIL_END_DOWN','TAIL_END_LEFT','TAIL_END_UP','TAIL_END_RIGHT'],
//     ENEMYTAIL: ['ENEMY_TAIL_END_DOWN','ENEMY_TAIL_END_LEFT','ENEMY_TAIL_END_UP','ENEMY_TAIL_END_RIGHT'],
//     PLAYERBODY: ['BODY_HORIZONTAL','BODY_VERTICAL','BODY_LEFT_DOWN','BODY_LEFT_UP','BODY_RIGHT_DOWN','BODY_RIGHT_UP'],
//     ENEMYBODY: ['ENEMY_BODY_HORIZONTAL','ENEMY_BODY_VERTICAL','ENEMY_BODY_LEFT_DOWN','ENEMY_BODY_LEFT_UP','ENEMY_BODY_RIGHT_DOWN','ENEMY_BODY_RIGHT_UP'],
//     ENEMYNORMALHEAD: ['ENEMY_HEAD_DOWN','ENEMY_HEAD_LEFT','ENEMY_HEAD_RIGHT','ENEMY_HEAD_UP']
// };
