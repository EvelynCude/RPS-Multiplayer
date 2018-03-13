//  Hide greeting on load
$("#game-info").hide();

//  Initialize Firebase
  var config = {
    apiKey: "AIzaSyAVwXY9-qaHzXxe9K7i8C_q2U0PU10h5uI",
    authDomain: "week-7-a4757.firebaseapp.com",
    databaseURL: "https://week-7-a4757.firebaseio.com",
    projectId: "week-7-a4757",
    storageBucket: "week-7-a4757.appspot.com",
    messagingSenderId: "1035480278037"
  };

  firebase.initializeApp(config);

  var database = firebase.database();
// On disconnect remove chat and turn objects in firebase
  database.ref("turn").onDisconnect().remove();
  database.ref("chat").onDisconnect().remove();



  console.log(database);

//  Game Variables
  var player;
  var playerName="";
  var numPlayers;



//If player exists display player name stored in firbase in player box
var changeRef = database.ref("players");
changeRef.once("value", function(snap){
  var exists1 = snap.child(1).exists();
  var exists2 = snap.child(2).exists();
  if (exists1){
    $("#player-1-display").text(snap.child(1).child("name").val()); 
  } else  {
    $("#player-1-display").text("Waiting for player ");
  }
  if (exists2){
    $("#player-2-display").text(snap.child(2).child("name").val()); 
  } else  {
    $("#player-2-display").text("Waiting for player ");
  }
});


//  From user form create new player in Firebase
$("#start-button").on("click", function(event){
  event.preventDefault();
    //  Get player name from user form
  playerName = $("#name-input").val().trim();
  $("#nameInput").val(playerName);
  //  $("#name-input").empty();
  //  Remove form from DOM and display game greeting
  $(".start-form").hide();
  $("#game-info").show();

  addPlayer();
});

// Add player to game
function addPlayer(){
  database.ref().once("value", function(snapshot) {
    var numPlayers = snapshot.child("players").numChildren();
    $("#game-info").text(numPlayers);

    if (numPlayers == 0) {
      // Sets player to 1
      var player = 1;
      playerNumber(player); 
    } else if (numPlayers == 1) {
        // Sets player to 2
        var player = 2;
        // Show player name in player box one
        playerNumber(player);
        // Start turn to 1
        database.ref("turn").set(1);
    }
   
  });

}

//  Show player number greeting and add player to firebase
function playerNumber(player){
  alert("#");
  $("#game-info").text("Hello " + playerName + ", you are player number " + player);
  var playerRef= database.ref("players").child(player);
  playerRef.onDisconnect().remove();
  playerRef.set({
    name: playerName,
    wins: 0,
    losses: 0
  });
    playerRef.on("value", function(snap){
      $("#player-"+player+"-display").text(snap.child("name").val());
    });
  var changeRef = database.ref("players");
    changeRef.on("value", function(snap){
      $("#player-"+player+"-display").text(snap.child(player).child("name").val());
    });
}











  
//------Chat Section -----------------//
  var messageField = $('#messageInput');
  var nameField = $('#name-input');
  var messageList = $('.messages');

    function addMessage(data) {
    var username = data.name || 'anonymous';
    var message = data.text;

    // Create an element
    var nameElement = $('<strong>').text(username + ":");
    var messageElement = $('<li>').text(message).prepend(nameElement);

    // Add the message to the DOM
    messageList.append(messageElement);

    // Scroll to the bottom of the message list
    messageList[0].scrollTop = messageList[0].scrollHeight;
  }
    // Listen for the form submit
  $('.chat').on('submit',function(e) {

    // stop the form from submitting
    e.preventDefault();
    console.log(messageField);
    // create a message object
    var message = {
      name : nameField.val(),
      text : messageField.val()
    }

    // Save Data to firebase
    database.ref("chat").push(message);

    // clear message field
    messageField.val('');

  });

  // Add a callback that is triggered for each chat message
  // this is kind of like an Ajax request, but they come in via websockets
  // 10 of them will load on page load, and any future messages will as well
  database.ref("chat").limitToLast(10).on('child_added', function (snapshot) {
    // Get data from returned
    addMessage(snapshot.val());
  });