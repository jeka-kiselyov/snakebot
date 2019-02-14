const ELEMENT = {
    NONE: ' ',
    WALL: '☼',
    START_FLOOR: '#',
    OTHER: '?',

    APPLE: '○',
    STONE: '●',
    FLYING_PILL: '©',
    FURY_PILL: '®',
    GOLD: '$',

    // игрок
    HEAD_DOWN: '▼',
    HEAD_LEFT: '◄',
    HEAD_RIGHT: '►',
    HEAD_UP: '▲',
    HEAD_DEAD: '☻',
    HEAD_EVIL: '♥',
    HEAD_FLY: '♠',
    HEAD_SLEEP: '&',

    TAIL_END_DOWN: '╙',
    TAIL_END_LEFT: '╘',
    TAIL_END_UP: '╓',
    TAIL_END_RIGHT: '╕',
    TAIL_INACTIVE: '~',

    BODY_HORIZONTAL: '═',
    BODY_VERTICAL: '║',
    BODY_LEFT_DOWN: '╗',
    BODY_LEFT_UP: '╝',
    BODY_RIGHT_DOWN: '╔',
    BODY_RIGHT_UP: '╚',

    // противник
    ENEMY_HEAD_DOWN: '˅',
    ENEMY_HEAD_LEFT: '<',
    ENEMY_HEAD_RIGHT: '>',
    ENEMY_HEAD_UP: '˄',
    ENEMY_HEAD_ONE_POINT_FROM_PLAYER: 'z',
    ENEMY_HEAD_DEAD: '☺',
    ENEMY_HEAD_EVIL: '♣',
    ENEMY_HEAD_FLY: '♦',
    ENEMY_HEAD_SLEEP: 'ø',

    ENEMY_LONGER_HEAD_POSSIBLE_MOVES: 'q',
    ENEMY_FURY_HEAD_POSSIBLE_MOVES: 'f',

    ENEMY_TAIL_END_DOWN: '¤',
    ENEMY_TAIL_END_LEFT: '×',
    ENEMY_TAIL_END_UP: 'æ',
    ENEMY_TAIL_END_RIGHT: 'ö',
    ENEMY_TAIL_INACTIVE: '*' ,

    ENEMY_BODY_HORIZONTAL: '─',
    ENEMY_BODY_VERTICAL: '│',
    ENEMY_BODY_LEFT_DOWN: '┐',
    ENEMY_BODY_LEFT_UP: '┘',
    ENEMY_BODY_RIGHT_DOWN: '┌',
    ENEMY_BODY_RIGHT_UP: '└'
};

module.exports.TAGS = {
    TOBEMARKEDASDANGEROUS: ['NONE', 'APPLE', 'STONE', 'FURY_PILL', 'GOLD', 'FLYING_PILL'],
    PLAYERTAIL: ['TAIL_END_DOWN','TAIL_END_LEFT','TAIL_END_UP','TAIL_END_RIGHT'],
    ENEMYTAIL: ['ENEMY_TAIL_END_DOWN','ENEMY_TAIL_END_LEFT','ENEMY_TAIL_END_UP','ENEMY_TAIL_END_RIGHT'],
    PLAYERBODY: ['BODY_HORIZONTAL','BODY_VERTICAL','BODY_LEFT_DOWN','BODY_LEFT_UP','BODY_RIGHT_DOWN','BODY_RIGHT_UP'],
    ENEMYBODY: ['ENEMY_BODY_HORIZONTAL','ENEMY_BODY_VERTICAL','ENEMY_BODY_LEFT_DOWN','ENEMY_BODY_LEFT_UP','ENEMY_BODY_RIGHT_DOWN','ENEMY_BODY_RIGHT_UP'],
    ENEMYNORMALHEAD: ['ENEMY_HEAD_DOWN','ENEMY_HEAD_LEFT','ENEMY_HEAD_RIGHT','ENEMY_HEAD_UP']
};

module.exports.ELEMENTRATINGS = {
    firstMoveFuryTargetElements: function() {
        let targetElements = this.furyTargetElements();
        targetElements[ELEMENT.TAIL_END_DOWN] = 10; /// target the tail in the hope to get stone felt from it
        targetElements[ELEMENT.TAIL_END_LEFT] = 10;
        targetElements[ELEMENT.TAIL_END_UP] = 10;
        targetElements[ELEMENT.TAIL_END_RIGHT] = 10;

        return targetElements;
    },
    furyTargetElements: function() {
        let targetElements = this.longTargetElements();
        targetElements[ELEMENT.FURY_PILL] = 3; /// reduce importance of fury pill if we are already under fury effect
        targetElements[ELEMENT.TAIL_END_DOWN] = 3; /// target the tail in the hope to get stone felt from it
        targetElements[ELEMENT.TAIL_END_LEFT] = 3;
        targetElements[ELEMENT.TAIL_END_UP] = 3;
        targetElements[ELEMENT.TAIL_END_RIGHT] = 3;

        targetElements[ELEMENT.ENEMY_HEAD_DOWN] = 7;
        targetElements[ELEMENT.ENEMY_HEAD_LEFT] = 7;
        targetElements[ELEMENT.ENEMY_HEAD_RIGHT] = 7;
        targetElements[ELEMENT.ENEMY_HEAD_UP] = 7;

        targetElements[ELEMENT.ENEMY_BODY_HORIZONTAL] = 5;
        targetElements[ELEMENT.ENEMY_BODY_VERTICAL] = 5;
        targetElements[ELEMENT.ENEMY_BODY_LEFT_DOWN] = 5;
        targetElements[ELEMENT.ENEMY_BODY_LEFT_UP] = 5;
        targetElements[ELEMENT.ENEMY_BODY_RIGHT_DOWN] = 5;
        targetElements[ELEMENT.ENEMY_BODY_RIGHT_UP] = 5;

        return targetElements;
    },
    longTargetElements: function() {
        let targetElements = this.defaultTargetElements();
        targetElements[ELEMENT.STONE] = 5;

        return targetElements;
    },
    defaultTargetElements: function() {
        let targetElements = {};

        targetElements[ELEMENT.APPLE] = 1;
        targetElements[ELEMENT.GOLD] = 10;
        targetElements[ELEMENT.FURY_PILL] = 20;

        return targetElements;
    },
    firstMoveFuryBlockingElements: function() {
        let blockingElements = this.furyBlockingElements();
        return blockingElements;
    },
    furyBlockingElements: function() {
        let blockingElements = this.longBlockingElements();

        //// we can target enemies when we are fury
        delete blockingElements[ELEMENT.ENEMY_HEAD_EVIL];

        delete blockingElements[ELEMENT.ENEMY_HEAD_DOWN];
        delete blockingElements[ELEMENT.ENEMY_HEAD_LEFT];
        delete blockingElements[ELEMENT.ENEMY_HEAD_RIGHT];
        delete blockingElements[ELEMENT.ENEMY_HEAD_UP];

        delete blockingElements[ELEMENT.ENEMY_LONGER_HEAD_POSSIBLE_MOVES];

        delete blockingElements[ELEMENT.ENEMY_HEAD_FLY];

        delete blockingElements[ELEMENT.ENEMY_BODY_HORIZONTAL];
        delete blockingElements[ELEMENT.ENEMY_BODY_VERTICAL];
        delete blockingElements[ELEMENT.ENEMY_BODY_LEFT_DOWN];
        delete blockingElements[ELEMENT.ENEMY_BODY_LEFT_UP];
        delete blockingElements[ELEMENT.ENEMY_BODY_RIGHT_DOWN];
        delete blockingElements[ELEMENT.ENEMY_BODY_RIGHT_UP];

        return blockingElements;
    },
    longBlockingElements: function() {
        let blockingElements = this.defaultBlockingElements();
        delete blockingElements[ELEMENT.STONE];

        return blockingElements;
    },
    defaultBlockingElements: function() {
        let blockingElements = {};

        blockingElements[ELEMENT.STONE] = Infinity;
        blockingElements[ELEMENT.WALL] = Infinity;
        blockingElements[ELEMENT.START_FLOOR] = Infinity;
        blockingElements[ELEMENT.OTHER] = Infinity;

        blockingElements[ELEMENT.ENEMY_LONGER_HEAD_POSSIBLE_MOVES] = 90;

        // blockingElements[ELEMENT.HEAD_EVIL] = Infinity;

        blockingElements[ELEMENT.ENEMY_TAIL_INACTIVE] = Infinity;
        blockingElements[ELEMENT.ENEMY_HEAD_SLEEP] = Infinity;

        blockingElements[ELEMENT.ENEMY_HEAD_EVIL] = Infinity;

        blockingElements[ELEMENT.ENEMY_HEAD_DOWN] = Infinity; /// little lower this, as it's possible enemy will change direction
        blockingElements[ELEMENT.ENEMY_HEAD_LEFT] = Infinity;
        blockingElements[ELEMENT.ENEMY_HEAD_RIGHT] = Infinity;
        blockingElements[ELEMENT.ENEMY_HEAD_UP] = Infinity;

        blockingElements[ELEMENT.ENEMY_HEAD_ONE_POINT_FROM_PLAYER] = Infinity;

        blockingElements[ELEMENT.ENEMY_HEAD_FLY] = Infinity; /// lower this, as flying is not deadly (todo: calc if fly on next move)

        blockingElements[ELEMENT.ENEMY_BODY_HORIZONTAL] = Infinity;
        blockingElements[ELEMENT.ENEMY_BODY_VERTICAL] = Infinity;
        blockingElements[ELEMENT.ENEMY_BODY_LEFT_DOWN] = Infinity;
        blockingElements[ELEMENT.ENEMY_BODY_LEFT_UP] = Infinity;
        blockingElements[ELEMENT.ENEMY_BODY_RIGHT_DOWN] = Infinity;
        blockingElements[ELEMENT.ENEMY_BODY_RIGHT_UP] = Infinity;

        blockingElements[ELEMENT.HEAD_DOWN] = Infinity;
        blockingElements[ELEMENT.HEAD_LEFT] = Infinity;
        blockingElements[ELEMENT.HEAD_RIGHT] = Infinity;
        blockingElements[ELEMENT.HEAD_UP] = Infinity;
        blockingElements[ELEMENT.HEAD_DEAD] = Infinity;
        blockingElements[ELEMENT.HEAD_EVIL] = Infinity;
        blockingElements[ELEMENT.HEAD_FLY] = Infinity;
        blockingElements[ELEMENT.HEAD_SLEEP] = Infinity;

        blockingElements[ELEMENT.BODY_HORIZONTAL] = 10;
        blockingElements[ELEMENT.BODY_VERTICAL] = 10;
        blockingElements[ELEMENT.BODY_LEFT_DOWN] = 10;
        blockingElements[ELEMENT.BODY_LEFT_UP] = 10;
        blockingElements[ELEMENT.BODY_RIGHT_DOWN] = 10;
        blockingElements[ELEMENT.BODY_RIGHT_UP] = 10;

        return blockingElements;
    },
    enemyFuryTargetElements: function() {
        let targetElements = this.enemyLongTargetElements();

        targetElements[ELEMENT.HEAD_DOWN] = 3;
        targetElements[ELEMENT.HEAD_LEFT] = 3;
        targetElements[ELEMENT.HEAD_RIGHT] = 3;
        targetElements[ELEMENT.HEAD_UP] = 3;

        targetElements[ELEMENT.BODY_HORIZONTAL] = 3;
        targetElements[ELEMENT.BODY_VERTICAL] = 3;
        targetElements[ELEMENT.BODY_LEFT_DOWN] = 3;
        targetElements[ELEMENT.BODY_LEFT_UP] = 3;
        targetElements[ELEMENT.BODY_RIGHT_DOWN] = 3;
        targetElements[ELEMENT.BODY_RIGHT_UP] = 3;

        return targetElements;  
    },
    enemyLongTargetElements: function() {
        let targetElements = this.enemyDefaultTargetElements();
        targetElements[ELEMENT.STONE] = 5;

        return targetElements;
    },
    enemyDefaultTargetElements: function() {
        let targetElements = {};

        targetElements[ELEMENT.APPLE] = 1;
        targetElements[ELEMENT.GOLD] = 10;
        targetElements[ELEMENT.FURY_PILL] = 20;

        return targetElements;        
    },
    enemyDefaultBlockingElements: function() {
        let blockingElements = {};

        blockingElements[ELEMENT.STONE] = Infinity;
        blockingElements[ELEMENT.WALL] = Infinity;
        blockingElements[ELEMENT.START_FLOOR] = Infinity;
        blockingElements[ELEMENT.OTHER] = Infinity;

        // blockingElements[ELEMENT.HEAD_EVIL] = Infinity;

        blockingElements[ELEMENT.ENEMY_TAIL_INACTIVE] = Infinity;
        blockingElements[ELEMENT.ENEMY_HEAD_SLEEP] = Infinity;

        blockingElements[ELEMENT.ENEMY_HEAD_EVIL] = Infinity;

        blockingElements[ELEMENT.ENEMY_HEAD_DOWN] = Infinity; /// little lower this, as it's possible enemy will change direction
        blockingElements[ELEMENT.ENEMY_HEAD_LEFT] = Infinity;
        blockingElements[ELEMENT.ENEMY_HEAD_RIGHT] = Infinity;
        blockingElements[ELEMENT.ENEMY_HEAD_UP] = Infinity;

        blockingElements[ELEMENT.ENEMY_HEAD_FLY] = Infinity; /// lower this, as flying is not deadly (todo: calc if fly on next move)

        blockingElements[ELEMENT.ENEMY_BODY_HORIZONTAL] = 10;
        blockingElements[ELEMENT.ENEMY_BODY_VERTICAL] = 10;
        blockingElements[ELEMENT.ENEMY_BODY_LEFT_DOWN] = 10;
        blockingElements[ELEMENT.ENEMY_BODY_LEFT_UP] = 10;
        blockingElements[ELEMENT.ENEMY_BODY_RIGHT_DOWN] = 10;
        blockingElements[ELEMENT.ENEMY_BODY_RIGHT_UP] = 10;

        blockingElements[ELEMENT.HEAD_DOWN] = Infinity;
        blockingElements[ELEMENT.HEAD_LEFT] = Infinity;
        blockingElements[ELEMENT.HEAD_RIGHT] = Infinity;
        blockingElements[ELEMENT.HEAD_UP] = Infinity;
        blockingElements[ELEMENT.HEAD_DEAD] = Infinity;
        blockingElements[ELEMENT.HEAD_EVIL] = Infinity;
        blockingElements[ELEMENT.HEAD_FLY] = 10;
        blockingElements[ELEMENT.HEAD_SLEEP] = Infinity;

        blockingElements[ELEMENT.BODY_HORIZONTAL] = Infinity;
        blockingElements[ELEMENT.BODY_VERTICAL] = Infinity;
        blockingElements[ELEMENT.BODY_LEFT_DOWN] = Infinity;
        blockingElements[ELEMENT.BODY_LEFT_UP] = Infinity;
        blockingElements[ELEMENT.BODY_RIGHT_DOWN] = Infinity;
        blockingElements[ELEMENT.BODY_RIGHT_UP] = Infinity;

        return blockingElements;
    }
};

module.exports.ELEMENTS = {
    enemyPossibleNextMoveElements: [
        ELEMENT.APPLE,
        ELEMENT.FURY_PILL,
        ELEMENT.FLYING_PILL,
        ELEMENT.GOLD,
        ELEMENT.NONE,
        ELEMENT.ENEMY_TAIL_END_DOWN,
        ELEMENT.ENEMY_TAIL_END_LEFT,
        ELEMENT.ENEMY_TAIL_END_UP,
        ELEMENT.ENEMY_TAIL_END_RIGHT,
        ELEMENT.TAIL_END_DOWN,
        ELEMENT.TAIL_END_LEFT,
        ELEMENT.TAIL_END_UP,
        ELEMENT.TAIL_END_RIGHT
    ],
    enemyHeadElements: [
                            ELEMENT.ENEMY_HEAD_DOWN, 
                            ELEMENT.ENEMY_HEAD_LEFT, 
                            ELEMENT.ENEMY_HEAD_RIGHT, 
                            ELEMENT.ENEMY_HEAD_UP, 
                            ELEMENT.ENEMY_HEAD_DEAD, 
                            ELEMENT.ENEMY_HEAD_EVIL, 
                            ELEMENT.ENEMY_HEAD_ONE_POINT_FROM_PLAYER,
                            ELEMENT.ENEMY_HEAD_FLY, 
                            ELEMENT.ENEMY_HEAD_SLEEP 
                        ],
    enemyBodyElements: [
                            ELEMENT.ENEMY_BODY_HORIZONTAL, 
                            ELEMENT.ENEMY_BODY_VERTICAL, 
                            ELEMENT.ENEMY_BODY_LEFT_DOWN, 
                            ELEMENT.ENEMY_BODY_LEFT_UP, 
                            ELEMENT.ENEMY_BODY_RIGHT_DOWN, 
                            ELEMENT.ENEMY_BODY_RIGHT_UP
                        ],
    defaultTargetElements: [ELEMENT.APPLE, ELEMENT.FURY_PILL, ELEMENT.GOLD],
    targetsAndStoneElements: [ELEMENT.APPLE, ELEMENT.STONE, ELEMENT.FURY_PILL, ELEMENT.GOLD],
    isPlayerSnakeElement: function(element) {
        const playerBody = [ELEMENT.HEAD_DOWN, ELEMENT.HEAD_LEFT, ELEMENT.HEAD_RIGHT, ELEMENT.HEAD_UP, ELEMENT.HEAD_DEAD, ELEMENT.HEAD_EVIL, 
                            ELEMENT.HEAD_FLY, ELEMENT.HEAD_SLEEP, ELEMENT.TAIL_END_DOWN, ELEMENT.TAIL_END_LEFT, ELEMENT.TAIL_END_UP, 
                            ELEMENT.TAIL_END_RIGHT, ELEMENT.TAIL_INACTIVE, ELEMENT.BODY_HORIZONTAL, ELEMENT.BODY_VERTICAL, ELEMENT.BODY_LEFT_DOWN, 
                            ELEMENT.BODY_LEFT_UP, ELEMENT.BODY_RIGHT_DOWN, ELEMENT.BODY_RIGHT_UP];
        if (playerBody.indexOf(element) === -1) {
            return false;
        } else {
            return true;
        }
    },
    isDeadlyElement: function(element) {
        const notDeadly = [ELEMENT.NONE, ELEMENT.APPLE, ELEMENT.FURY_PILL, ELEMENT.FLYING_PILL, ELEMENT.GOLD];
        const playerBody = [ELEMENT.HEAD_DOWN, ELEMENT.HEAD_LEFT, ELEMENT.HEAD_RIGHT, ELEMENT.HEAD_UP, ELEMENT.HEAD_DEAD, ELEMENT.HEAD_EVIL, 
                            ELEMENT.HEAD_FLY, ELEMENT.HEAD_SLEEP, ELEMENT.TAIL_END_DOWN, ELEMENT.TAIL_END_LEFT, ELEMENT.TAIL_END_UP, 
                            ELEMENT.TAIL_END_RIGHT, ELEMENT.TAIL_INACTIVE, ELEMENT.BODY_HORIZONTAL, ELEMENT.BODY_VERTICAL, ELEMENT.BODY_LEFT_DOWN, 
                            ELEMENT.BODY_LEFT_UP, ELEMENT.BODY_RIGHT_DOWN, ELEMENT.BODY_RIGHT_UP];
        if (notDeadly.indexOf(element) == -1 && playerBody.indexOf(element) == -1) {
            return true;
        } else {
            return false;
        }
    },
    isNonBlockingElement: function(element) {
        const notDeadly = [ELEMENT.NONE, ELEMENT.APPLE, ELEMENT.FURY_PILL, ELEMENT.FLYING_PILL, ELEMENT.GOLD, 
                            ELEMENT.TAIL_END_DOWN, ELEMENT.TAIL_END_LEFT, ELEMENT.TAIL_END_RIGHT, ELEMENT.TAIL_END_UP];
        if (notDeadly.indexOf(element) != -1) {
            return true;
        } else {
            return false;
        }
    },
    isTargetElement: function(element) {
        const notDeadly = [ELEMENT.APPLE, ELEMENT.FURY_PILL, ELEMENT.FLYING_PILL, ELEMENT.GOLD];
        if (notDeadly.indexOf(element) != -1) {
            return true;
        } else {
            return false;
        }
    }
};

module.exports.ELEMENT = ELEMENT;

module.exports.COMMANDS = {
    UP: 'UP', // snake momves
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    ACT: 'ACT', // drop stone if any
};
