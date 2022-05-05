var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
require('dotenv').config();
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("Connected to Posts"));
        
        
}catch (error) {
    console.log("could not connect");
}

var PostsSchema = new Schema({
    description: {
        type: String
    },
    imageUrl: {
        type: String,
        required: true
    },
    user: {
        type: String, 
        required: true
    },

})

PostsSchema.pre('save', function(next) {
    next();
});

module.exports = mongoose.model('Posts', PostsSchema);
