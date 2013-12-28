"use strict";

var Server = require("./server/src/Server");

Server.initialize(__dirname);
Server.listen();