var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _ip = Schema({
    ip: { type: Number},
    cuntry: {type: String},
    seq: { type: Number, default: 0 },
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 },
});

var ip = mongoose.model('ip', _ip);
module.exports = ip;