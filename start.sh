#!/usr/bin/env bash

if ! [ -x "$(command -v forever)" ]; then
	echo "forever.js is not installed. Installing..."
	npm install forever -g
fi

forever start --spinSleepTime 1000 --minUptime 50 app.js play default