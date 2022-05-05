var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
require('dotenv').config();
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("Connected to Comments"));
}catch (error) {
    console.log("could not connect");
}

var CommentSchema = new Schema({
    postId: {
        type: String,
    },
    quote: {
        type: String,
        required: true
    },
    user: {
        type: String, required: true
    },
})

CommentSchema.pre('save', function(next) {
    next();
});

module.exports = mongoose.model('Comment', CommentSchema);