var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var jwt_decode = require('jwt-decode');
const util = require("util");
var cors = require('cors');
var User = require('./Users');
var Comment = require('./Comments');
const Posts = require('./Posts');
const Comments = require('./Comments');
require("dotenv").config();
var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

// '/signup' methods

router.route('/signup')
    .post(function(req, res) {
        if (!req.body.username || !req.body.password) {
            res.json({success: false, msg: 'Please include name, username, and password to signup.'})
        } else {
            var user = new User();
            user.name = req.body.name;
            user.username = req.body.username;
            user.password = req.body.password;

            user.save(function(err){
                if (err) {
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'A user with that username already exists.'});
                    else
                        return res.json(err);
                }

                res.json({success: true, msg: 'Successfully created new user.'})
            });
        }
    })
    .get(function(req, res){
        res.json({success: false, msg: 'Does not support the GET method.'});
    })
    .put(function(req, res){
        res.json({success: false, msg: 'Does not support the PUT method.'});
    })
    .delete(function(req, res){
        res.json({success: false, msg: 'Does not support the DELETE method.'});
    })
    .patch(function(req, res){
        res.json({success: false, msg: 'Does not support the PATCH method.'});
    })

// '/signin' methods
router.route('/signin')
    .post(function (req, res) {
        var userNew = new User();
        userNew.username = req.body.username;
        userNew.password = req.body.password;

        if(!req.body.username || !req.body.password){
        return res.json({success: false, msg: "Please include a username and password."});
        }
        
        User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
            
            if(user == null){
                return res.json({success: false, msg: 'Authentication failed.'});
            }
            user.comparePassword(userNew.password, function(isMatch) {
                if (isMatch) {
                    var userToken = { id: user.id, username: user.username };
                    var token = jwt.sign(userToken, process.env.SECRET_KEY);
                    res.json ({success: true, token: 'JWT ' + token});
                }
                else {
                    res.status(401).send({success: false, msg: 'Authentication failed.'});
                }
            })
        })
    })
    .get( function(req, res){
        res.json({success: false, msg: 'Does not support the GET method.'});
    })
    .put(function(req, res){
        res.json({success: false, msg: 'Does not support the PUT method.'});
    })
    .delete(function(req, res){
        res.json({success: false, msg: 'Does not support the DELETE method.'});
    })
    .patch(function(req, res){
        res.json({success: false, msg: 'Does not support the PATCH method.'});
    })


router.route('/posts')
    .post(authJwtController.isAuthenticated, function(req, res) {
        console.log(req.body);

        if(!req.body.imageUrl){
            return res.json({status: false, msg: "Please include an image url."});
        }

        var post = new Posts();
        post.description = req.body.description;
        post.imageUrl = req.body.imageUrl;
        post.user =  jwt_decode(req.headers.authorization).username;
        post.likes = 0;
        
        post.save(function(err) {
            if(err){
                console.log("Error: " + err)
            }
            else{
                res.json({success: true, msg: 'Successfully added post.'})
            }
        })

    })
    .get(function(req, res){
        var url = new URL('localhost:8080' + req.url);
        var postId = url.searchParams.get('postId');
    
        if(postId === null){
            Posts.find(function(err, postsList){
                if(err) throw err;
                else{
                    console.log("Get request")
                    return res.json(postsList);

                }
            });
        }
        else{
            var _post;


            Posts.findOne({_id: postId}, function(err, post){
                if(err) throw err;
                _post = post;
            })

            Comments.find({postId: postId}, function(err, comments){
                if(err) throw err;


                else{
                    if(_post){
                        var description = _post.description;
                        var imageUrl = _post.imageUrl;
                        var user = _post.user;
                        var likes = _post.likes; 
                        return res.json({description, imageUrl, user, likes, comments});
                    }
                }
            
            })
            
        }
    })

router.route('/comments')
    .post(authJwtController.isAuthenticated, function(req, res) {
        if(!req.body.postId || !req.body.quote){
            res.json({success: false, msg: 'Fill out the form.'})
        }
        else{
            var comment = new Comment();
            comment.postId= req.body.postId;
            comment.quote = req.body.quote;
            comment.user = jwt_decode(req.headers.authorization).username;
            comment.save(function(err) { 
                if(err){
                    console.log("Error: " + err)
                }
                else{
                    res.json({success: true, msg: "Successfully added comment."})
                }
            });
        }
    })
    .get(function(req, res) {

        Comment.find({postId: req.body.postId}, function(err, comments){
            if(err)(console.log(err))
            res.json(comments)
        })
    })

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only
