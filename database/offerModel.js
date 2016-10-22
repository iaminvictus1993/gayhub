var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fields = require('./fields'); 
//遍历创建model
for(var i in fields) {
    mongoose.model(i, new Schema(fields[i]));
}
//创建获取model的方法
exports.getModel = function(name) {
    return mongoose.model(name);
}