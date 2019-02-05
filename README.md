# snakebot

Snake Bot for [https://epam-bot-challenge.com.ua/](https://epam-bot-challenge.com.ua/)

 - CLI, no browser required
 - Recreates sessions on new days
 - mocha+chai unit tests
 - 🐍❤️ 

### Installation

```bash
    git clone https://github.com/jeka-kiselyov/snakebot.git
    cd snakebot
    npm install
```

### Usage

##### Configuration

For setting up credentials, use snakebot's config tool:
```bash
    node app.js config
```

Answer 4 simple questions:
```
info: Going to update credentials...                     
prompt: Config name:  (default)                          
prompt: Game server domain name:  (epam-bot-challenge.com.ua)   
prompt: username:  example@gmail.com                            
prompt: password: 
```

Configuration json object will be stored in `config/` directory. Now you can run the bot `node app.js play` for the game using default config name or `node app.js play configname` for specific one.

##### Run the bot

Using `default` configuration
```bash
    node app.js play
```
or specific one
```bash
    node app.js play configname
```

##### Run the bot in forever mode

Using forever.js, restarts the bot on failure, connection issues etc.

```bash
    . start.sh
```

##### Run unit tests

Check them out in `app/tests` folder.

```bash
    grunt test
```

##### Run tests in live mode

Run tests each time .js file updated (you hit Ctrl+S in IDE):

```bash
    grunt watchtests
```

### License

MIT

### Author

[Jeka Kiselyov](https://github.com/jeka-kiselyov)
