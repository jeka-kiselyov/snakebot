const {Program,Command,LovaClass} = require('lovacli');

const GameClient = require('../classes/GameClient.js');
const prompt = require('prompt-async');

const path = require('path');
const fs = require('fs');

const crypto = require('crypto');

class Handler extends Command {
    async setup(progCommand) {
        progCommand.description('Update auth and test server connection');
    }

    async handle(args, options, logger) {
        this.logger.info("Going to update credentials...");

        prompt.start();

        let input = await prompt.get({
                properties:{
                    configName: {
                        required: true,
                        description: 'Config name',
                        default: 'default'
                    },
                    domain: {
                        required: true,
                        description: 'Game server domain name',
                        default: 'epam-bot-challenge.com.ua'
                    },
                    username: {
                        pattern: /^\S+@\S+\.\S+$/,
                        message: 'Usually it is email address',
                        description: 'Player email',
                        required: false
                    },
                    readableName: {
                        description: 'Player name',
                        required: false
                    },
                    password: {
                        hidden: true,
                        required: true
                    }
                }
            });

        this.logger.info("Testing credentials, trying to sign in to server...");

        input.password = crypto.createHash('md5').update(input.password).digest("hex");
        console.log(input);
        let gc = new GameClient(input);
        let success = await gc.tryToLogin();

        if (success) {
            this.logger.info("Works cool");
            let data = JSON.stringify(input, null, 2);
            fs.writeFileSync(path.join(__dirname, '../../config/'+input.configName+'.json'), data);
            this.logger.info("Settings saved in "+input.configName+" Run node app.js player "+input.configName+" for some action");

        } else {

            this.logger.info("Something is wrong. Try to check your credentials");
        }


        this.program.exit();
    }
};

module.exports = Handler;