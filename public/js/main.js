var username;
$(document).ready(function(){
  $('.username-container__submit').on('click', function(){
    username = $('.username-container__input').val();
    if(username != ''){
      $('.username-container').hide();
      $('.chat-container').show();
       var containerHeight = $('.chat-container').height();
       var formHeight = $('.chat-container__form').height();
      $('.chat-container').height(containerHeight - formHeight);
      $(".chat-container__messages").scrollTop($(".chat-container__messages")[0].scrollHeight);
    }
  });
  $('.username-container__input').keypress(function (e) {
    var key = e.which;
    if(key == 13) {
      $('.username-container__submit').click();
    }
  });
  $('#imageButton').on('click', function(){
    $('#imageFile').click();
  });
  $('#imageFile').on('change', function(e) {
    var file = e.originalEvent.target.files[0],
    reader = new FileReader();

    reader.onload = function(evt) {
      var jsonObject = {
        'image': evt.target.result,
        'name': username
      }
      socket.emit('image', jsonObject);
    };
    reader.readAsDataURL(file);
  });
});
var socket = io();
var messageCount = 0;
$('.chat-container__form').submit(function(){
  if($('#m').val() == ''){
    return false;
  }
  socket.emit('chat message', $('#m').val(), username);
  $('#m').val('');
  return false;
});
socket.on('history', function(history){
  if(messageCount == 0){
    var startIndex = 0;
    messageCount = 100;
    if (history.length < 100){
      messageCount = history.length;
    }else if(history.length > 100){
      startIndex = history.length - 100;
    }
    for(var i = startIndex ; i < history.length; i++) {
      if(history[i].type == 'text'){
        showChat(history[i].value, history[i].name);
      }else if(history[i].type == 'image'){
        $('#messages').append('<li>'+history[i].name+': <img width="100" src="'+history[i].value+'"></li>');
      }
    }
  }
});
socket.on('chat message', function(msg, name){
  showChat(msg,name);
  messageCount++;
  if(messageCount > 100){
    $('#messages li:first-child').remove();
    messageCount = 100;
  }
});
socket.on('image', function(image, name){
  var img = '<li>'+name+': <img width="100" src="'+image+'"></li>';
  $('#messages').append(img);
  $(".chat-container__messages").scrollTop($(".chat-container__messages")[0].scrollHeight);
});

function showChat(msg, name){
  var asteriskCheck = msg.match(/^[*].+[*]$/);
  if(asteriskCheck != null){
    var msg = msg.substr(1, msg.lastIndexOf('*')-1)
    // $('#messages').append($('<li>').text(name+': '+msg));
    $('#messages').append('<li>'+name+': <span>'+msg+'</span></li>');
    $( "#messages li:last-child span" ).css('font-weight', 'bold');
  }else if(msg.indexOf("https://www.google.com") !== -1 ){
    var msgLink = msg.replace('https://www.google.com', '<a href="https://www.google.com">Google</a>');
    $('#messages').append('<li>'+name+': '+msgLink+'</li>');
  }else{
    $('#messages').append($('<li>').text(name+': '+msg));
  }
  $(".chat-container__messages").scrollTop($(".chat-container__messages")[0].scrollHeight);
}