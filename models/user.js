const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    Name:{
        type :"String",
    },
    Email:{
        type :"String",
        required: true
    },
    Birthday:{
        type :"String",
    },
    Gender:{
        type :"String",
    },
    Country:{
        type :"String",
    },
    Password:{
        type :"String",
    },
    Token:{
        type :"String",
    },
    Image:{
        type:"String"
    },

})

module.exports = mongoose.model("User",userSchema);