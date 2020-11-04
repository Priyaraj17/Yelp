var express = require("express");
var router = express.Router();
var bodyParser      =     require("body-parser");
var Campground  =  require("../models/campground");
//INDEX : show all campgrounds
router.get("/", isLoggedIn, function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("index", {campgrounds: allCampgrounds, currentUser: req.user});
        }
    });
});

//CREATE: Add a new campground to database
router.post("/", isLoggedIn, function(req, res){
    var name=req.body.name;
    var image=req.body.image;
    var description= req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground={name:name, image: image, description:description, author: author}
    //Create a new campground and save it to the dataBase
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/campgrounds");
        }
    });
});
// NEW- show form to create new campgrounds
router.get("/new", isLoggedIn, function(req, res){
    res.render("new");
});

//SHOW : shows a particular campgrounds
router.get("/:id", isLoggedIn, function(req, res){
    //Find the campground with a particular id
    //Render the page
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE:

router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("edit", {campground:foundCampground})
    });
});

//Update Campgrounds

router.put("/:id",checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.send("Not found");
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

router.delete("/:id",checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndDelete(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    });
});

function checkCampgroundOwnership(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect("/campgrounds");
            }else{
                //does he owns the campground?
                if(foundCampground.author.id.equals(req.user._id)){
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
