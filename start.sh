#!/bin/bash

npm run dev &
node ./schedule/index.js &
wait
