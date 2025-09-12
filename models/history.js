const mongoose = require('mongoose');
const historySchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    history: [ ]
})
module.exports = mongoose.model('History', historySchema);
