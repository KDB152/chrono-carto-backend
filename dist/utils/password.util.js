"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcrypt = require("bcryptjs");
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
//# sourceMappingURL=password.util.js.map