// Our custom middleware for checking if a user is logged in
const requiresLogin = require('../config/middleware/requiresLogin.js');

const Post = require("../logic/postsLogic");
const posts = new Post();
const db = require("../models");

module.exports = function (app) {

    // Authorization Express Error Handler If not authorized return
    app.use(function (err, req, res, next) {
        console.error(`Error: ${err}`);
        res.status(401).json(`Auth Error Caught in Server: ${err}`);
    });

    // Get all posts for a logged in user
    // app.get("/api/post", (req, res) => {
    //     let uid = "CQyn1ufM0uVLNUOwgIc1eSuLdmq1";
    app.get("/api/post", requiresLogin, (req, res) => {
        let uid = req.user.uid; // get uid from req on require login

        try {
            posts.getAllForUser(uid)
                .then(postsData => {
                    res.json(postsData);
                }).catch(err => {
                    console.error(`error selecting with where ${err}`);
                    res.status(500).json(err.errors[0].message);
                });
        } catch (err) {
            res.status(500).json(`Error caught in route app.get("/api/post ..." ${err.errors[0].message}`);
        }
    });

    // Get a single post with a specific Id
    // app.get("/api/post/:id", (req, res) => {
    //     let postId = req.params.id; // post id from parm

    app.get("/api/post/:id", requiresLogin, (req, res) => {
        let postId = req.params.id; // post id from parm

        db.Post.findOne({
            where: {
                id: postId
            },
            include: [db.Photo]
        }).then(function (dbPost) {
            res.json(dbPost);
        }).catch(err => {
            res.status(422).json(`Error caught in route app.get("/api/post/:id ..." ${err.errors[0].message}`);
        });
    });

    // ================================================================================================================================
    // create post with or without photo
    // ================================================================================================================================
    app.post("/api/post", requiresLogin, (req, res) => {
        let post = req.body;
        let uid = req.user.uid; // put on by auth

        try {
            let photoInfo = undefined;
            // You MUST have both post fileName (full gcsObject file path name) and public URL to save a photo for a post
            // Otherwise just save the post without a photo since it is not required to have one
            if (post.fileName && post.url) {
                photoInfo = {};
                photoInfo.fileName = post.fileName;
                photoInfo.url = post.url;
            }

            posts.createUserPost(uid, post, photoInfo).then(post => {
                res.json(post);
            }).catch(err => {
                console.error(`error creating post : ${err}`);
                res.status(422).json(err.errors[0].message);
            });
        } catch (err) {
            res.status(422).json(`Error caught in route app.post("/api/post ..." ${err.errors[0].message}`);
        }
    }); // Route

    // ================================================================================================================================
    // Update post with or without photo
    // Minimal right now, wont update photo
    // ================================================================================================================================
    app.put("/api/post", requiresLogin, (req, res) => {
        let post = req.body;

        db.Post.update(
            post, {
                where: {
                    id: post.id
                }
            }
        ).then((dbPost) => {
            res.json(dbPost);
        }).catch(err => {
            res.status(422).json(`Error caught in route app.put("/api/post ..." ${err.errors[0].message}`);
        });
    });

    // ================================================================================================================================
    // Delete post with or without photo
    // ================================================================================================================================
    // app.delete("/api/post/:id", (req, res) => {
    //     let postId = req.params.id;
    app.delete("/api/post/:id", requiresLogin, (req, res) => {
        let postId = req.params.id;
        posts.deletePost(postId).then(post => {
            res.json(post);
        }).catch(err => {
            console.error(`error deleting post : ${err}`);
            res.status(422).json(`Error caught in route app.delete("/api/post/:id..." ${err.errors[0].message}`);
        });
    });

}; // module.exports