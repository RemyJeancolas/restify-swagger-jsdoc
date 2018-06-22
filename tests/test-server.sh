#!/bin/bash
MOCHA_PATH=./node_modules/.bin/mocha

npm install restify@^4 --no-save --progress=false
$MOCHA_PATH tests --require ts-node/register --bail ./tests/server.ts

npm install restify@^5 --no-save --progress=false
$MOCHA_PATH tests --require ts-node/register --bail ./tests/server.ts

npm install restify@^6 --no-save --progress=false
$MOCHA_PATH tests --require ts-node/register --bail ./tests/server.ts