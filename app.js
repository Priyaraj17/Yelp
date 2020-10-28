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
    var commentRoutes = require("./routes/comments"),
     campgroundRoutes = require("./routes/campgrounds"),
     indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', port);
module.exports = app;
app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/public"));

//seedDB();

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

app.use(indexRoutes);
app.use(commentRoutes);
app.use("/campgrounds",campgroundRoutes);



app.listen(port, function(err){ 
    if (err) console.log("Error in server setup") 
    console.log("Server listening on Port", port); 
});