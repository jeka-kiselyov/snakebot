#!/usr/bin/env node

const {Program,Command,LovaClass} = require('lovacli');
const path = require('path');
const pjson = require(path.join(__dirname, 'package.json'));

let program = new Program({
		"name": "EPAM Snake Contest Service Worker",
		"debug": true,
		"version": pjson.version,
		"paths": {
			"commands": path.join(__dirname, "app/commands"),
			"tests": path.join(__dirname, "app/tests")
		}
	});

program.init();