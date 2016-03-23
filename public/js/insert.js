var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'web_messenger'
});

connection.connect();

for (var i=0; i < 90; i++){
	var message = {
		type: 'text',
		value: i+1,
		name: 'Test01'
	}
	var query = connection.query('insert into history set ?', message, function( err, result){
		if (err) {
			console.error(err);
			return;
		}
		console.error(result);
	});
}

connection.end();