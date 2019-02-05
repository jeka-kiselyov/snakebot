const {Program,Command,LovaClass} = require('lovacli');
const WebSocket = require('ws');

const GameBoard = require('./GameBoard.js');
const ArrayHelper = require('./ArrayHelper.js');

const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

class GameClient extends LovaClass { /// EventEmmiter
	constructor(config = {}) {
		super();

		this._ws = null;
		this._board = null;

		this._config = {
			domain: config.domain || null,
			username: config.username || null,
			password: config.password || null  //// should be stored as md5 hash
		};

		this._code = '';
		this._server = '';

		this._previousBoards = [];
	}

	get previousBoards() {
		return this._previousBoards;
	}

	get board() {
		return this._board;
	}

	storePreviousBoard() {
		if (this._board) {
			this._previousBoards.push(this._board);
			if (this._previousBoards.length > 50) {
				this._previousBoards.shift();
			}			
		}
	}

	async login() {
		let loginURL = 'https://'+this._config.domain+'/codenjoy-balancer/rest/login';
		try {
			let postData = JSON.stringify({
				email: ''+this._config.username,
				password: ''+this._config.password
			});
			let response = await axios.post(loginURL, postData, {
			        headers: {
			            'Content-Type': 'application/json',
			        }
			    });

			if (response.data.code && response.data.server) {
				this._code = response.data.code;
				this._server = response.data.server;

				return true;				
			} else {
				return false;
			}
		} catch(e) {
			console.log(e);
			return false;
		}

		/// response
		/// {"email":"xxx@gmail.com","id":"xxx","code":"134534571309016356","server":"game1.epam-bot-challenge.com.ua"}
	}

	async initializeSocket() {
		let wsURL = 'wss://'+this._server+'/codenjoy-contest/ws?user='+this._config.username+'&code='+this._code;
		this._ws = new WebSocket(wsURL, null, {
			handshakeTimeout: 1100
		});

		this._ws.on('error', (e)=>{
			console.log('error');
			console.log(e);
			this.emit('error');
		});
		this._ws.on('open', ()=>{
			console.log('connected');
			this._ws.send('');

			this.emit('connected');
		});
		this._ws.on('message', (data, flags)=>{
			console.log('income message');
			try {
			    let pattern = new RegExp(/^board=(.*)$/);
			    let message = data;
			    let parameters = message.match(pattern);
			    let board = parameters[1];

			    this.storePreviousBoard();
			    this._board = new GameBoard(board);
				this.emit('update'); /// @todo: fire if it's actually updated, not same
			} catch(e) {
				this.emit('error');
			}
			// this._ws.send('');
		});
		this._ws.on('close', ()=>{
		    console.log('disconnected');
		    this.emit('disconnected');
		});
	}

	async loadBoardFromFile(filename) {
		let data = fs.readFileSync(filename, 'utf8');
		data = data.split("\n").join('');
		this._board = new GameBoard(data);

		return true;		
	}

	async saveBoardToFile(filename) {
		let data = this._board.asArray().join("\n");
		fs.writeFileSync(filename, data);
		
		return true;
	}

	async saveGameStateToFile(filename) {
		let gameState = {
			board: this._board.asArray(true),
			previousBoards: []
		};
		for (let i = 0; i < this.previousBoards.length; i++) {
			gameState.previousBoards.push(this.previousBoards[i].asArray(true));
		}

		gameState.previousBoards = gameState.previousBoards.reverse();

		let data = JSON.stringify(gameState, null, 2);
		fs.writeFileSync(filename, data);

		return true;
	}

	async sendCommand(command) {
		console.log('COMMAND: '+command);
		if (command) {
			this._ws.send(command);
		} else {
			this._ws.send('');
		}
	}

}

module.exports = GameClient;