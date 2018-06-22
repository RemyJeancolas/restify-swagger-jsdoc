#!/bin/bash
MOCHA_PATH=./node_modules/.bin/mocha

npm install restify@^7 --no-save --progress=false
$MOCHA_PATH tests --require ts-node/register --bail ./tests/server.ts