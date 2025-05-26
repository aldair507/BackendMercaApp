"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_URL = exports.ACCESS_TOKEN = exports.JWT_SECRET = exports.NODE_ENV = exports.DB_URI = exports.PORT = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
_a = process.env, exports.PORT = _a.PORT, exports.DB_URI = _a.DB_URI, exports.NODE_ENV = _a.NODE_ENV, exports.JWT_SECRET = _a.JWT_SECRET, exports.ACCESS_TOKEN = _a.ACCESS_TOKEN, exports.BASE_URL = _a.BASE_URL;
