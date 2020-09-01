var express = require("express");
var app = express();
var port = "1000";
app.set('port', port);
module.exports = app;
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

var campgrounds= [
    {name: "Salmon Creek", image: "https://www.photosforclass.com/download/pb_2512944"},
    {name: "Granite Hill", image: "https://www.photosforclass.com/download/pb_1892494"},
    {name: "Mountain Goat's Rest", image: "https://www.photosforclass.com/download/pb_2825197"}
]

app.get("/", function(req,res){
    res.render("landing");
});

app.post("/campgrounds", function(req, res){
    var name=req.body.name;
    var image=req.body.image;
    var newCampground={name:name, image: image}
    campgrounds.push(newCampground);
    res.redirect("/campgrounds");
});

app.get("/campgrounds" ,function(req, res){
    res.render("campgrounds", {campgrounds: campgrounds});
});

app.get("/campgrounds/new", function(req, res){
    res.render("new");
});






app.listen(port, function(err){ 
    if (err) console.log("Error in server setup") 
    console.log("Server listening on Port", port); 
})