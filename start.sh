#!/bin/sh

forever --minUptime 1000 --spinSleepTime 1000 -e server/logs/error.log -o server/logs/normal.log index.js --no-colors