const {Program,Command,LovaClass} = require('lovacli');

const GameClient = require('../classes/GameClient.js');
const GameBoard = require('../classes/GameBoard.js');
const Player1 = require('../classes/Player1.js');

const path = require('path');

class Handler extends Command {
    async setup(progCommand) {
        progCommand.description('Watch for game fields and save game states when player dies');
        progCommand.argument('[configName]', 'Config name to use', null, 'default');
    }

    async handle(args, options, logger) {
        let config = {};
        try {
            config = require(path.join(__dirname, '../../config/'+args.configName+'.json'));
        } catch(e) {
            this.logger.error("Invalid configName: "+args.configName);
            this.program.exit();
        }
        this.logger.debug("Config loaded");

        const gc = new GameClient(config);
        let loggedIn = await gc.login();

        if (!loggedIn) {
            this.logger.error("Can not sign in to the server");  
            this.program.exit();          
        }

        await gc.initializeSocket();

        gc.on('update', ()=>{
            try {
                let isJustDead = false;
                if (gc.board.isGameOver() || gc.board.isGameSleeping()) {
                    if (gc.previousBoards.length) {
                        if (!gc.previousBoards[gc.previousBoards.length - 1].isGameOver() && !gc.previousBoards[gc.previousBoards.length - 1].isGameSleeping()) {
                            isJustDead = true;
                        }
                    }
                }

                if (isJustDead) {
                    console.log('DEATH!!!');
                    let filename = (new Date().toLocaleString())+".state";
                    filename = filename.split(' ').join('_').split(':').join('-');
                    gc.saveGameStateToFile(path.join(__dirname, "../tests/deaths/"+filename));                    
                }

                gc.sendCommand('');
            } catch(e) {
                console.log(e);
                this.program.exit();
            }           
        });

        gc.on('error',()=>{
            this.program.exit();
        });
        gc.on('disconnected',()=>{
            this.program.exit();
        });
    }
};

module.exports = Handler;