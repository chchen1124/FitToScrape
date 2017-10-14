// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the article information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].headline + "<br />" + data[i].summary + "<br />" + data[i].url + "</p>");  
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The headline of the article
      $("#notes").append("<h2>" + data.headline + "</h2>");
      // An input to enter a new note
      $("#notes").append("<input id='notes-inputter' name='note' >");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        console.log(data.note.comment);
        // Place the comment of the note in the comment input
        $("#notes-inputter").val(data.note.comment);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {

  // Run a POST request to change the notes, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url:"/notes/",
    data: {
      // Value taken from title input
      comment: $("#notes-inputter").val(),
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
    });

  // Also, remove the values entered in the input area for note entry
  $("#notes-inputter").val("");
});
