var express    = require("express"),
    mongoose   = require("mongoose"),
    app        = express(),
    port       = "1000",
    bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));

app.set('port', port);
module.exports = app;
app.set('view engine', 'ejs');

//DataBase Schema

var campgroundSchema= new mongoose.Schema({
    name:String,
    image: String,
    description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);
/*
Campground.create(
    {
        name:"Nainital",
        image:"https://images.unsplash.com/photo-1483381719261-6620dfa2d28a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=755&q=80",
        description:"It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)."
    }, function(err, campground){
        if(err){
            console.log(err);
        }else{
            console.log("New Campground");
            console.log(campground);
        }
});*/

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
            res.render("index", {campgrounds: allCampgrounds});
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
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("show", {campground: foundCampground});
        }
    });
})





app.listen(port, function(err){ 
    if (err) console.log("Error in server setup") 
    console.log("Server listening on Port", port); 
})