//Amazon Web Services
var AWS = require("aws-sdk");

//Express server
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var net = require('net');
app.use(express.static('public'));

//VARIABLES PARA TCP.
var TCP_HOST = "ec2-54-86-114-164.compute-1.amazonaws.com";
var TCP_PORT = 3150;

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


//TCP server
net.createServer(function (connection) {
    console.log("NEW TCP CONNECTION");

    connection.on('data', function (data) {
        //Converting buffer data to String
        var data_str = data.toString();
        console.log("NEW DATA ON TCP: ", data_str);
        //dump all carrier return
        data_str = data_str.replace('\r\n', '');
        //CONVIRTIENDO DATA DE STRING A JSON.
        var telemetry_data = querystring.parse(data_str);
        if (telemetry_data.id == undefined || telemetry_data.r == undefined || telemetry_data.p == undefined) {
            //If the keys have undefined data, do nothing.
            return;

        }

    });

}).listen(TCP_PORT, TCP_HOST, function () {
    console.log('TCP Server listening on ' + TCP_HOST + ' port ' + TCP_PORT + ' ...');
});

http.listen(8080, function () {
    console.log("Web Server Started.");
});

process.on("uncaughtException", function (err) {
    console.log("uncaughtException", err);
});
