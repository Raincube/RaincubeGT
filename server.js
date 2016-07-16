//Amazon Web Services
var AWS = require("aws-sdk");

//Express server
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static('public'));

//AWS & DynamoDB
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com",
});

var docClient = new AWS.DynamoDB.DocumentClient();

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/public/dashboard.html');
});

//Socket.io Service
io.on("connection", function (socket) {
    console.log("New socket.io client");




});





http.listen(8080, function () {
    console.log("Web Server Started.");
});

process.on("uncaughtException", function (err) {
    console.log("uncaughtException", err);
});
