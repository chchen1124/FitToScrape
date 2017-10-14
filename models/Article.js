// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // headline is a required string
  headline: {
    type: String,
    required: true
  },
  // summary is a required string
  summary: {
    type: String,
    required: true
  },
  // url is a required string
  url: {
    type: String,
    required: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model  
  note: {
    type:Schema.Types.ObjectId,
    ref:"Note"
  }
});



// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
