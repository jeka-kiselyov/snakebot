const {Program,Command,LovaClass} = require('lovacli');

const GameClient = require('../classes/GameClient.js');
const GameBoard = require('../classes/GameBoard.js');
const Player1 = require('../classes/Player1.js');

const path = require('path');

class Handler extends Command {
    async setup(progCommand) {
        progCommand.description('Play the game');
        progCommand.argument('[configName]', 'Config name to use', null, 'default');
    }

    async handle(args, options, logger) {
        let config = {};
        try {
            config = require(path.join(__dirname, '../../config/'+args.configName+'.json'));
        } catch(e) {
            this.logger.error("Invalid configName: "+args.configName+" Don't you forget to run config command first?");
            this.program.exit();
        }
        this.logger.debug("Config loaded");

        const gc = new GameClient(config);
        let loggedIn = await gc.login();

        if (!loggedIn) {
            this.logger.error("Can not sign in to the server");  
            this.program.exit();          
        }

        const player = new Player1();

        await gc.initializeSocket();

        gc.on('update', ()=>{
            try {
                player.lookAtBoard(gc.board, gc.previousBoards); 
                gc.sendCommand(player.command);
            } catch(e) {
                console.log(e);
                this.program.exit();
            }           
        });

        gc.on('error',(e)=>{
        console.log(e);
            this.program.exit();
        });
        gc.on('disconnected',()=>{
            this.program.exit();
        });
    }
};

module.exports = Handler;