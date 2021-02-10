#!/bin/bash

node _develop/foreman.js &
FOREMAN_PID=$!

sleep 20s

./node_modules/.bin/jasmine test/functional/epic.js
EXIT_CODE=$?

kill -s SIGINT $FOREMAN_PID

exit $EXIT_CODE
