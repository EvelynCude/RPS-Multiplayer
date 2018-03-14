//  Hide unessary features on load
  $("#game-info").hide();
  $("#set-choice-1").hide();
  $("#set-choice-2").hide();

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

// .ref("") used frequently.... store in variable
  var playerRef= database.ref("players");
  var turnRef= database.ref("turn");
  var numRef;
  


//  Game Variables
  var player;
  var playerName="";
  var numPlayers;
  var names={};
  var turn;
  var player1wins;
  var player2wins;
  var player1losses;
  var player2losses;
  var player1choice="";
  var player2choice="";
  var click="";


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
      player = 1;
      playerNumber(player); 
    } else if (numPlayers == 1) {
        // Sets player to 2
        player = 2;
        // Show player name in player box one
        playerNumber(player);
        // Start turn to 1
        turnRef.set(1);
    }
  });

}
//  Show players in player boxes when a player has been added
  playerRef.on("child_added", function(childSnapshot){
    var key = childSnapshot.key;
    names[key] = childSnapshot.val().name;
    console.log(names[key]);
    $("#player-"+key+"-display").text(names[key]);
  });

//  Remove player when disconnected
  playerRef.on("child_removed", function(childSnapshot){
    var key = childSnapshot.key;
    console.log(key);
    // show player disconnected in chatbox
    disconnectMessage(key);
    // Remove player name from DOM
    $("#player-"+key+"-display").text("Waiting for player "+ key);
    $(".choice").hide();
    $("#numWins-1").text("");
    $("#numLosses-1").text("");
    $("#numWins-2").text("");
    $("#numLosses-2").text("");
  });

//  Show player number greeting and add player to firebase
function playerNumber(player){
  $("#game-info").text("Hello " + playerName + ", you are player number " + player);
  numRef= database.ref("players").child(player);
  numRef.onDisconnect().remove();
  numRef.set({
    name: playerName,
    wins: 0,
    losses: 0,
  });
}

//  Who's turn
  turnRef.on("value", function(snapshot){
    var turn=snapshot.val();
    if(turn == 1 ){
      $(".choice").hide();
      $("#numWins-1").text("");
      $("#numLosses-1").text("");
      $("#numWins-2").text("");
      $("#numLosses-2").text("");
      turn1();
    }
    else if(turn == 2){
      turn2();
    }
    else if(turn == 3){
      turn3();
    }
  });

// What to display on user DOM on turn one
function turn1(){
  $("#game-box").addClass("player-box");
  // Add player one box color/highlight
  $("#player-box-one").removeClass("player-box");
  $("#player-box-one").addClass("player-turn-box");
  if (player == 1){
    $("#player-1-rock").show();
    $("#player-1-paper").show();
    $("#player-1-scissors").show();
    $("#player-1-scissors").show();
      $(".choice").click(function userClick(){
        click = $(this).attr("data-choice");
        $("#player-1-rock").hide();
        $("#player-1-paper").hide();
        $("#player-1-scissors").hide();
        $("#player-1-scissors").hide();
        saveChoice();
   });
  }
  messageT1();
}

// What to display on user DOM on turn two
function turn2(){
  // Remove player one box color/highlight
  $("#player-box-one").removeClass("player-turn-box");
  $("#player-box-one").addClass("player-box");
  // Add player two box color/highlight
  $("#player-box-two").removeClass("player-box");
  $("#player-box-two").addClass("player-turn-box");
  if (player == 1){
    $("#player-1-rock").hide();
    $("#player-1-paper").hide();
    $("#player-1-scissors").hide();
    $("#player-1-scissors").hide();
  }
  else if (player ==2){
    $("#player-2-rock").show();
    $("#player-2-paper").show();
    $("#player-2-scissors").show();
    $("#player-2-scissors").show(); 
      $(".choice").click(function userClick(){
        click = $(this).attr("data-choice");
        $("#player-2-rock").hide();
        $("#player-2-paper").hide();
        $("#player-2-scissors").hide();
        $("#player-2-scissors").hide();
        saveChoice();
   });   
  }
  messageT2();
}

//  What to do after first round (Turn 3)
function turn3(){
  $("#game-info").text("");
  // Remove player two box color/highlight
  $("#player-box-two").removeClass("player-turn-box");
  $("#player-box-two").addClass("player-box");
  // Add Game Results Box color/highlight
  $("#game-box").removeClass("player-box");
  $("#game-box").addClass("player-turn-box");
  if (player == 1){
    $("#player-1-rock").hide();
    $("#player-1-paper").hide();
    $("#player-1-scissors").hide();
    $("#player-1-scissors").hide();
  }
  else if (player ==2){
    $("#player-2-rock").hide();
    $("#player-2-paper").hide();
    $("#player-2-scissors").hide();
    $("#player-2-scissors").hide();    
  }
  gameLogic();
}

function saveChoice(){
  numRef.update({
    choice: click
  });
  $("#set-choice-" + player).show();
  $("#set-choice-" + player).text(click);
  turnRef.once("value", function(snapshot){
    turn = snapshot.val();
    turn ++;
    turnRef.set(turn);
  });

}

function gameLogic(){
  playerRef.once("value", function(snapshot){
    var player1 = snapshot.val()[1];
    var player2 = snapshot.val()[2];
    player1choice = player1.choice; //Player one choice = player1choice
    player1wins = player1.wins;
    player1losses = player1.losses;
    player2choice = player2.choice; //Player two choice = player2choice
    player2wins = player2.wins;
    player2losses = player2.losses;
    //  show stored player values on both players' DOM
    $("#set-choice-1").show();
    $("#set-choice-2").show();
    $("#set-choice-1").text(player1choice);
    $("#numWins-1").text(player1wins);
    $("#numLosses-1").text(player1wins);
    $("#set-choice-2").text(player2choice);
    $("#numWins-2").text(player2wins);
    $("#numLosses-2").text(player2wins);


      if(player1choice=="Rock" && player2choice=="Scissors")
        $("#winning-player").text("Player 1 wins!");

      if(player1choice=="Rock" && player2choice=="Paper")
        $("#winning-player").text("Player 2 wins!");

      if(player1choice=="Scissors" && player2choice=="Rock")
        $("#winning-player").text("Player 2 wins!");
      
      if(player1choice=="Scissors" && player2choice=="Paper")
        $("#winning-player").text("Player 2 wins!");
      
      if(player1choice=="Paper" && player2choice=="Rock")
        $("#winning-player").text("Player 1 wins!");
      
      if(player1choice=="Paper" && player2choice=="Scissors")
        $("#winning-player").text("Player 2 wins!");
      
      if(player1choice==player2choice)
        $("#winning-player").text("Tie!");
 })
}



//--------Game Messages Section---------------//
function messageT1(){
  if (player ==1){
    $("#game-info").text("It's your turn!");
  }
  else if (player ==2){
    $("#game-info").text("Waiting for " + names[1] +" to choose.");
  }
}

function messageT2(){
  if (player ==1){
    $("#game-info").text("Waiting for " + names[2] +" to choose.");
  }
  else if (player ==2){
    $("#game-info").text("It's your turn!");
  }
}




  
//-------------Chat Section -----------------//

function disconnectMessage(key){
  var disconnect={
    name: names[key],
    text: "has disconnected"
  }
  database.ref("chat").push(disconnect);
}

  var messageField = $('#messageInput');
  var nameField = $('#name-input');
  var messageList = $('.messages');


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