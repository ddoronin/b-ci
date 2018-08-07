'use strict';

const WebSocket = require('ws');
const meow      = require('meow');
const chalk     = require('chalk');
const readline  = require('readline');
const { BSON }  = require('bson');

const cli = meow(`
  Usage
    $ npm start [options] ws://echo.websocket.org
`);

let url;
if (cli.input.length > 0) url = cli.input[0];
else {
    console.error('Missing url');
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}).on('SIGINT', () => {
    console.log();
    process.exit();
});

const bson = new BSON();
const ws = new WebSocket(url);
ws.on('open', () => {
    let sent = Date.now();

    console.log(chalk.green(`Connected to ${url}`));
    rl.prompt();

    ws.on('message', (message, flags) => {
        let output = '';
        const recv = Date.now();
        output += `${recv} `;
        if(flags.binary)    output += `< ${JSON.stringify(bson.deserialize(message), null, ' ')}`;
        else                output += `< ${message}`;
        output += ` (${recv - sent}ms)`;
        clear();
        console.log(chalk.gray(output));
        rl.prompt();
    });

    rl.on('line', (message) => {
        sent = Date.now();
        clearPrev();
        console.log(`${sent} > ${message}`);
        rl.prompt();
        ws.send(message);
        rl.prompt();
    });
});

function clear() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
}

function clearPrev() {
    readline.moveCursor(process.stdout, 0, -1);
    clear();
}
