/* Showing Mongoose's "Populated" Method
 * =============================================== */

// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
// Requiring our User and Article models
var Article = require("./models/Article.js");
var User=require("./models/User.js");
var Note=require("./models/Note.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use body parser with our app
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

//Database config with Mongoose
var databaseUrl='mongodb://localhost/MyArticlesDB';

if(process.env.MONGODB_URI)
{
  mongoose.connect(process.env.MONGODB_URI);
}
else
{
  mongoose.connect(databaseUrl);
  var db = mongoose.connection;

  // Show any mongoose errors
  db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
  });

  // Once logged in to the db through mongoose, log a success message
  db.once("open", function() {
    console.log("Mongoose connection successful.");
  });  
}
// End of database configuration

// Routes
// ======

// A GET request to scrape the www.time.com website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.time.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this).children("a").text();
      result.summary=$(this).children("a").text();
      result.url = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Create a new article
app.post("/articles", function(req, res) {
  // Create a new article and pass the req.body to the entry
  var newArticle = new Article(req.body);

  // And save the new article the db
  newArticle.save(function(error, doc) {
    // Log any errors
    if (error) {
      res.send(error);
    }
    else
    {
      // Find our user and push the new note id into the User's notes array
      Article.findOneAndUpdate({_id:doc._id }, { $push: { "articles": doc._id } }, { new: true }, function(err, newarticle) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newarticle to the browser
        else {
          res.send(newarticle);
        }
      });    	
    }
  });
});

// This will get the notes we scraped from the mongoDB
app.get("/notes", function(req, res) {
  // Grab every doc in the Notes array
  Note.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Create a new Note
app.post("/notes/", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      res.send(error);
    }
    else
    {
      // Find our user and push the new note id into the User's notes array
      Note.findOneAndUpdate({_id: doc._id}, { "notes": doc._id }, { new: true }, function(err, newnote) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newnote to the browser
        else {
          res.send(newnote);
        }
      });     
    }
  });
});

// Delete a note based on the comment
app.delete("/notes/:comment",function(req,res){
  var newNote=new Note(req.body);
  newNote.save(function(error,doc){
    if(error)
    {
      res.send(error);
    }
    else
    {
      Note.deleteOne({"comment": doc.comment});
    }
  });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});