var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var ObjectId = Schema.types.ObjectId;
module.exports = {
    user:{
        userName: {
            type: String,
            //required: true
        },
        passWord: {
            type: String,
            //required: true
        },
        // email: {
            // type: String,
            // required: true
        // },
        salt: {
            type: String
        }
    }
};