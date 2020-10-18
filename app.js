var express    = require("express"),
    mongoose   = require("mongoose"),
    app        = express(),
    bodyParser = require("body-parser"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    User        =   require("./models/users"),
    Campground =  require("./models/campground"),
    Comment    =   require("./models/comment"),
    seedDB     =  require("./seeds");

    var port="1000";
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', port);
module.exports = app;
app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/public"));

seedDB();

app.use(require("express-session")({
    secret: "Once again I won",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser=req.user;
    next();
});

app.get("/", function(req,res){
    res.render("landing");
});
//INDEX : show all campgrounds
app.get("/campgrounds" ,function(req, res){
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
app.post("/campgrounds", function(req, res){
    var name=req.body.name;
    var image=req.body.image;
    var description= req.body.description;
    var newCampground={name:name, image: image, description:description }
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
app.get("/campgrounds/new", function(req, res){
    res.render("new");
});

//SHOW : shows a particular campgrounds
app.get("/campgrounds/:id", function(req, res){
    //Find the campground with a particular id
    //Render the page
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("show", {campground: foundCampground});
        }
    });
})


app.get("/campgrounds/:id/comment/new", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comment-new", {campground:campground});
        }
    })
});

app.post("/campgrounds/:id/comments",isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            Comment.create(req.body.comment, function(err, text){
                if(err){
                    console.log(err);
                }else{
                    campground.comments.push(text);
                    campground.save();
                    res.redirect('/campgrounds/'+campground._id);
                }
            });
        }
    });
});


//AUTHENTICATE ROUTES:
app.get("/register",function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    var newUser= new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register")
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/campgrounds");
        });
    });
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login"
    }), function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(port, function(err){ 
    if (err) console.log("Error in server setup") 
    console.log("Server listening on Port", port); 
});