var http = require('http');
var express = require('express');
var session = require('express-session');
var app = express();
var sqlite3 = require('sqlite3').verbose();  
var url = require('url');
var uuid = require('uuid');
var bodyParser = require('body-parser');
// var jwt = require('jwt-simple');
var jwt = require('jsonwebtoken');
var request = require('request');

fs = require('fs');


var db = new sqlite3.Database('test.db'); 

app.use(express.static('content'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(session({secret: 'ssshhhhh'}));


//Session variable
var sess



app.get('/UserName', function (req, res) {

	var userName = String(sess.firstName) + "  " + String(sess.lastName);
	res.send(userName);
});

app.get('/logout',  function (req, res) {


  req.session.destroy(function(err){  

        if(err){  
            console.log(err);  
        }  
        else  
        {
          sess = req.session
        
          res.send('http://localhost:8081/')

        }  
    });

 
})



app.post('/sso/oidc',  function (req, res) {


  var id_token = req.body["id_token"];

  // console.log(id_token);

  sess = req.session

   
    //Keys for decoding. Generated using script https://github.com/jpf/okta-jwks-to-pem   
  var pemKeys = "-----BEGIN PUBLIC KEY-----"+"\n"+
"<public key here>"
"-----END PUBLIC KEY-----"


  var id_token_json = jwt.verify(id_token, pemKeys,  { algorithms: ['RS256']});

  // var id_token_json = jwt.decode(id_token, pemKeys);


  var userName = id_token_json["email"];

  sess.firstName = id_token_json["given_name"];
  sess.lastName = id_token_json["family_name"];
  sess.email = id_token_json["email"];

  // Create user if not already present in
  db.get("SELECT userName FROM 'Users' WHERE userName='"+userName+"'",
         function(err, rows) {

          
    if(err !== null) {
      console.log(err);
   
    }
    else if(rows === undefined) {
      // console.log("No rows found")
      var userId = String(uuid.v1());	
      db.run("INSERT INTO 'Users' (userId, UserName) VALUES ('"+ userId+"','"+ userName+"')", function(err) {
  
	   if(err !== null) {
	   	
	     console.log(String(err))
	     res.writeHead(400, {'Content-Type': 'text/plain'});
	     res.end(JSON.stringify(err));

	    } 
	    else{

	      // res.writeHead(200, {'Content-Type': 'text/json'});
	      res.end(JSON.stringify("SUCCESS"));

	   }
	  });

    }
    else {
    	
      

    }
  }); 

  if (sess != undefined)
  {
    res.redirect('http://localhost:8081/')
  }

                  
})




// Creaate Task
app.post('/Task',  function (req, res) {

   
  var url_parts = url.parse(req.url, true);

  var req_url =  url_parts.pathname;

  var taskDate = req.body.taskDate;
  
  var taskName = req.body.taskName;


  if(sess != undefined)
  {

    var userName = sess.email;


    var taskId = String(uuid.v1());
  
  
    db.run("INSERT INTO 'Tasks' (id, UserName, TaskDateTime, TaskName) VALUES ('"+ taskId+"','"+userName+"','"+ taskDate+"','"+ taskName+"')", function(err) {
    
     if(err !== null) {

       console.log(String(err))
       res.writeHead(400, {'Content-Type': 'text/plain'});
       res.end(JSON.stringify(err));

      } 
      else{

        res.writeHead(200, {'Content-Type': 'text/json'});
        res.end(JSON.stringify("SUCCESS"));
     }
    });
  }
                     
})


app.get('/Task', function (req, res) {

  var url_parts = url.parse(req.url, true);

  var req_url =  url_parts.pathname;

  var query = url_parts.query;

  // If session is set
  if(sess != undefined)
  {

    var userName = sess.email;

    date  = query["date"];

     db.all("SELECT * FROM Tasks WHERE TaskDateTime='" + date + "' and UserName='" + userName + "'",
           function(err, rows) {
            
      if(err !== null) {
        console.log(err);
      }
      else if(rows === undefined) {
       console.log("No rows found");
        res.send("");
      }
      else {
       
        var response = "";
        for (var i = 0; i < rows.length; i++)
        {
            response = response + "<li class=\"list-group-item\" >" + rows[i]["TaskName"] + "</li>";
        }

        res.send(response);

      }
    });
  }

});

app.delete('/Task', function (req, res) {

  var url_parts = url.parse(req.url, true);

  var req_url =  url_parts.pathname;

  var query = url_parts.query;

  // If session is set
  if(sess != undefined)
  {

      var userName = sess.email;

      date  = query["date"];
      task = query["task"];
    


      db.run("DELETE FROM Tasks WHERE TaskDateTime='" + date + "' and TaskName='" + task + "' and UserName='" + userName + "'",
             function(err) {
        console.log(err);
        if(err !== null) {
          console.log(err);
        }
        else {
     
         // res.writeHead(200, {'Content-Type': 'text/html'});
         res.send("200");
        }

    });
  }

  

});


app.get('/', function (req, res) {

  if (sess != undefined)
  {
        fs.readFile('To_Do_List.html', function (err, html) {
          if (err) {
              throw err; 
          }       
           res.writeHeader(200, {"Content-Type": "text/html"});  
          res.write(html);  
          res.end(); 
      
    });
  }
  else 
  {
        fs.readFile('login-widget.html', function (err, html) {
          if (err) {
              throw err; 
          }       
           res.writeHeader(200, {"Content-Type": "text/html"});  
          res.write(html);  
          res.end(); 

        });

  }

});


var server = app.listen(8081, function () {

  console.log("Server Running...");
  
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Tasks'",
         function(err, rows) {
          
    if(err !== null) {
      console.log(err);
    }
    else if(rows === undefined) {
      // console.log("No rows found")
      db.run('CREATE TABLE Tasks ("id" primary key, "UserName" VARCHAR(255), "TaskDateTime" VARCHAR(255), "TaskName" VARCHAR(255))', function(err) {
        if(err !== null) {
          console.log(err);
        }
        else {
          //console.log("SQL Table 'Users' initialized.");
        }
      });
    }
    else {
     // console.log("SQL Table 'Users' already initialized.");
    }
  }); 

   db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'",
         function(err, rows) {
          
    if(err !== null) {
      console.log(err);
    }
    else if(rows === undefined) {
      // console.log("No rows found")
      db.run('CREATE TABLE Users ("userId" primary key, "UserName" VARCHAR(255))', function(err) {
        if(err !== null) {
          console.log(err);
        }
        else {
          //console.log("SQL Table 'Users' initialized.");
        }
      });
    }
    else {
     // console.log("SQL Table 'Users' already initialized.");
    }
  }); 

})



