var express = require("express");
var router = express.Router({mergeParams:true});
var Campground=  require("../models/campground");
const comment = require("../models/comment");
var Comment   =  require("../models/comment");

router.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comment-new", {campground:campground});
        }
    })
});

router.post("/campgrounds/:id/comments",isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/'+campground._id);
                }
            });
        }
    });
});

//COMMENT-EDIT
router.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }else{
            res.render("comment-edit", { campground_id : req.params.id, comment: foundComment});
        }
    });
});

//COMMENT-UPDATE:
router.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+ req.params.id);
        }
    });
});

//COMMENT-DELETE:
router.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
    //find and delete
    comment.findByIdAndDelete(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("/campgrounds");
            }else{
                //does he owns the campground?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    res.send("You Can't to that");
                }
            }
        });
    }else{
        res.send("You can not do that");
    }
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports  =  router;
