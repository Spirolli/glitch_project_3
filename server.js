'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect("mongodb+srv://Joe-Schmoe:Rubusto1@cluster0-wjw9y.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// THING I HAVE ADDED BELOW
const dns = require('dns');
var Schema = mongoose.Schema;

var urlSchema = new Schema({
  idNo: Number,
  urlString: String
});

var shortURL = mongoose.model('shortURL', urlSchema);

var newIdNo = 1;

app.post('/api/shorturl/new', function(req, res) {
  var url = req.body.url;
  var hostname = url;
  if (hostname.indexOf('http') != -1) {
    hostname = hostname.slice(hostname.lastIndexOf('/',8)+1);
  }
  dns.lookup( hostname, function (err, address, family) {
    console.log(address);
    console.log(err);
    if (err) {
      res.json({"error": "invalid URL"});
    } else {
      console.log(newIdNo);
      var newURL = new shortURL({idNo: newIdNo, urlString: url});
      console.log(newURL);
      newURL.save( function (err) {
        console.log("Data has been saved");
        if (err) console.error(err);
      });
      res.json({"original_url": url, "short_url": newIdNo});
      newIdNo++;
    } 
  });
});

app.get("/api/shorturl/:id", function(req,res) {
  console.log("I have been called with id: " + req.params.id);
  var idNo = req.params.id
  shortURL.find({"idNo": idNo}, function (err, data) {
    if (err) return err;
    console.log(data[0].urlString);
    res.redirect(data[0].urlString);
  });
});

app.get('/api/delete', function (req, res) {
  var newIdNo = 1;
  shortURL.deleteMany({}, function (err) {
    console.log("Documents have been deleted");
    res.send("Documents have been deleted");
  });
});

app.get('/api/printDB', function (req,res) {
  console.log("The database is trying to be printed");
  shortURL.find({}, function (err, data) {
    console.log(data);
    res.json({"Help": "helpojf"});
  });
});
// THING I HAVE ADDED ABOVE
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});