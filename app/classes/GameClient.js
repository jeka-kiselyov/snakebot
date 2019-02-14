const {Program,Command,LovaClass} = require('lovacli');
const WebSocket = require('ws');
const querystring = require('querystring');

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
			readableName: config.readableName || config.username || '',
			username: config.username || '',
			password: config.password || null  //// should be stored as md5 hash
		};

		let random = ''+(config.prefix ? config.prefix : '')+(''+Math.random()).split('.').join('');
		if (this._config.username) {
			this._config.username = this._config.username.split('%random%').join(random);
		}
		if (this._config.readableName) {
			this._config.readableName = this._config.readableName.split('%random%').join(random);			
		}

		this._code = config.code || '';
		this._server = config.domain || '';
		this._id = config.id || '';

		this._mostRecentMessageDate = null;

		this._websocketPath = config.websocketPath || 'wss://%server%/codenjoy-contest/ws?user=%username%&code=%code%';

		this._previousBoards = [];
	}

	startIdleTimeout() {
		this._mostRecentMessageDate = new Date();
		setInterval(()=>{
				let millisFromMostRecentMessages = ((new Date).getTime() - this._mostRecentMessageDate.getTime());
				console.log('Idle check: '+millisFromMostRecentMessages);
				if (millisFromMostRecentMessages > 10000) {
					console.log('Idle timeout');
					this._ws.close();
				}
			}, 1500);
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

	async tryToLogin() {
		let success = false;
		success = await this.loginRedirect(true);
		if (!success) {
			success = await this.loginRedirect(false);
		}
		if (!success) {
			success = await this.login();
		}

		return success;
	}

	// async loginDevServer(ssl = false) {
	// 	let loginURL = 'http://'+this._config.domain+'/codenjoy-contest/register';
	// 	if (ssl) {
	// 		loginURL = 'https://'+this._config.domain+'/codenjoy-contest/register'; 
	// 	}

	// 	try {
	// 		let postData = {
	// 			readableName: ''+this._config.readableName || ''+this._config.username,
	// 			name: ''+this._config.username,
	// 			password: ''+this._config.password,
	// 			game: 'Contest',
	// 			data: '',
	// 			gameName: 'snakebattle'
	// 		};
	// 		// console.log(postData);
	// 		let response = await axios.post(loginURL, querystring.stringify(postData), {
	// 				headers: {
	// 					'Content-Type': 'application/x-www-form-urlencoded'
	// 				}
	// 			});

	// 		let finalURL = response.request.res.responseUrl;
	// 		let username = finalURL.split('/player/')[1].split('?')[0];
	// 		let code = finalURL.split('code=')[1];

	// 		this._code = code;
	// 		this._id = username;

	// 		return true;
	// 	} catch(e) {
	// 		console.log(e);
	// 		// console.log(e.response.status);
	// 		return false;
	// 	}
	// }

	async loginRedirect(ssl = true) {
		let loginURL = 'http://'+this._config.domain+'/codenjoy-contest/register';
		if (ssl) {
			loginURL = 'https://'+this._config.domain+'/codenjoy-contest/register'; 
		}
		
		try {
			let postData = {
				readableName: ''+this._config.readableName || ''+this._config.username,
				name: ''+this._config.username,
				password: ''+this._config.password,
				game: 'Contest',
				data: '',
				gameName: 'snakebattle'
			};
			let response = await axios.post(loginURL, querystring.stringify(postData), {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				});

			let finalURL = response.request.res.responseUrl;

			console.log(finalURL);

			let username = finalURL.split('/player/')[1].split('?')[0];
			let code = finalURL.split('code=')[1];

			this._code = code;
			this._id = username;

			return true;
		} catch(e) {
			// console.log(e);
			if (e && e.response && e.response.status) {
				console.log(e.response.status);				
			}
			return false;
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
		// let wsURL = 'ws://'+this._server+'/codenjoy-contest/ws?user='+this._config.username+'&code='+this._code;

		let wsURL = this._websocketPath;
		wsURL = wsURL.split('%server%').join(this._server);
		wsURL = wsURL.split('%domain%').join(this._config.domain);
		wsURL = wsURL.split('%code%').join(this._code);
		wsURL = wsURL.split('%id%').join(this._id);
		wsURL = wsURL.split('%username%').join(this._config.username || this._id);


		console.log(wsURL);

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
			this.startIdleTimeout();

			this.emit('connected');
		});
		this._ws.on('message', (data, flags)=>{
			console.log('income message');
			this._mostRecentMessageDate = new Date();
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
		console.log('Took '+((new Date).getTime() - this._mostRecentMessageDate.getTime())+'ms to think');
		if (command) {
			this._ws.send(command);
		} else {
			this._ws.send('');
		}
	}

}

module.exports = GameClient;