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
var connections_number = 0;
//LIBRERIAS PARA TCP
var querystring = require('querystring');

//tcp device connection.

var deviceConnected;

//AWS & DynamoDB
AWS.config.update({
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com",
});

var docClient = new AWS.DynamoDB.DocumentClient();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/dashboard.html');
});


//MONITOR DE CONEXIONES.
app.get('/monitor', function (req, res) {
    res.sendFile(__dirname + '/public/monitor.html');
});

//Socket.io Service
io.on("connection", function (socket) {
    console.log("New socket.io client");

    //EVENTOS DEL WEBSITE........
    //EN EL MONITOR DE CONEXIONES, SE ENVIA LA CANTIDAD DE CONEXIONES ACTUALES.
    io.emit("connectionsUpdated", {
        "cantidad": connections_number
    });

    socket.on("halfPila", function (data) {
        console.log("HALF PILA REQUEST");
        try {
            deviceConnected.write("{H}");
            socket.emit("pilaRequest", {
                success: true
            });
        } catch (e) {
            console.log("ERROR: unable to connect to Pila", e)
            socket.emit("pilaRequest", {
                success: false
            });
        }
    });

    socket.on("fullPila", function (data) {
        console.log("FULL PILA REQUEST");

        try {
            deviceConnected.write("{F}");
            socket.emit("pilaRequest", {
                success: true
            });
        } catch (e) {
            console.log("ERROR: unable to connect to Pila", e)
            socket.emit("pilaRequest", {
                success: false
            });
        }
    });
});


//TCP server
net.createServer(function (connection) {

    console.log("*************NEW TCP CONNECTION**************");

    deviceConnected = connection;

    connections_number++

    io.emit("connectionsUpdated", {
        "cantidad": connections_number
    });

    io.emit("newDatafromTCP", {
        "data": "NEW CONNECTION"
    });

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
            console.log("undefined data");
            return;
        } else {

            console.log("GOOD DATA");
            io.emit("newDatafromTCP", {
                "data": data_str
            });

        }
    });

    connection.on('close', function () {
        console.log('TCP DEVICE DISCONNECTED.');
        connections_number--;

        io.emit("newDatafromTCP", {
            "data": "DEVICE DISCONNECTED"
        });

        io.emit("connectionsUpdated", {
            "cantidad": connections_number
        });
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
