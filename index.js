//jshint esversion:6
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('nodemcu');
app.use(bodyParser.urlencoded({ extended: true }));

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS task(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,status TEXT)");
});


app.get('/requests', (req, res) => {
    var sql = "select * from task where status = ?"
    var params = ["notcompleted"]
    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
  });
  
app.post('/command',(req, res) => { 
    try {
        var data = {
            name: req.body.name,
            status: "notcompleted"
        }
        var sql = 'INSERT INTO task(name,status) VALUES(?,?)'
        var params = [data.name,data.status]
        db.run(sql, params, function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                "message": "success",
                "data": data,
                "id" : this.lastID
            })
        });
    }catch (error) {
      console.log(error);
      return res.status(500);
    }
});
  
app.patch("/api/:id", (req, res, next) => {
    console.log(req.params.id);
    console.log(req.body.name);
    console.log(req.body.status);
    var data = {
        name: req.body.name,
        status: req.body.status
    }
    db.run(
        "UPDATE task SET status = ? WHERE id = ?", data.status, req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

  let port = process.env.PORT;
  if(port == null || port == ""){
    port = 3000;
  }
  
  app.listen(port,function(){
      console.log("Server running");
  });  