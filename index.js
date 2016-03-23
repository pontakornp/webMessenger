var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var mysql = require('mysql');
var tmp = require('tmp');
var shortid = require('shortid');

app.use(express.static('public'));
app.use('/scripts', express.static('node_modules/bootstrap/dist/'));
app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database: 'web_messenger'
  });
  connection.connect();
  var query = connection.query('select * from history', function(err, result) {
    if (err) {
    }else{
      io.emit('history', result);
    }
  })
  connection.end();

  socket.on('chat message', function(msg, name){
  	io.emit('chat message', msg, name);
    console.log(connection);
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
      database: 'web_messenger'
    });
    connection.connect();
    var message = {
      type: 'text',
      value: msg,
      name: name
    }
    var query = connection.query('insert into history set ?', message, function( err, result){
      if (err) {
        console.error(err);
        return;
      }
      console.error(result);
    });
    connection.end();
  });

  socket.on('image', function(data) {
    if (data != null) {
      var image = data.image;
      var name = data.name;
      var imageBuffer = decodeBase64Image(image);
      var imageType = imageBuffer.type;
      imageType = imageType.toLowerCase();
      var extension = null;
      if (imageType.indexOf("png") !== -1) {
        extension = ".png";
      } else if(imageType.indexOf("jpg") !== -1 || imageType.indexOf("jpeg") !== -1) {
        extension = ".jpg";
      } else if(imageType.indexOf("gif") !== -1) {
        extension = ".gif";
      };
      var imagePath = 'images/'+shortid.generate()+extension;

      fs.writeFile('public/'+imagePath, imageBuffer.data, function(err) {
        if(!err){
          io.emit('image', imagePath, name);

          var connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '',
            database: 'web_messenger'
          });
          connection.connect();
          var message = {
            type: 'image',
            value: imagePath,
            name: name
          }
          var query = connection.query('insert into history set ?', message, function( err, result){
            if (err) {
              console.error(err);
              return;
            }
            console.error(result);
          });
          connection.end(); 
        }
      });
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

// var imageBuffer = decodeBase64Image(data);
// console.log(imageBuffer);
// { type: 'image/jpeg',
//   data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 00 b4 00 00 00 2b 08 06 00 00 00 d1 fd a2 a4 00 00 00 04 67 41 4d 41 00 00 af c8 37 05 8a e9 00 00 ...> }