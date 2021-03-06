//Express server
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var net = require('net');
app.use(express.static('public'));
var mensajesMonitor = [];

//VARIABLES PARA TCP.
var TCP_PORT = 3140;
var connections_number = 0;
//LIBRERIAS PARA TCP
var querystring = require('querystring');

//tcp device connection.
var deviceConnected;
var currentLevels = {
    pila: 0,
    raincube: 0
};

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
    socket.emit("newLevel", currentLevels);

    socket.emit("connectionsUpdated", {
        "cantidad": connections_number
    });

    io.emit("newDatafromTCP", {
        "data": mensajesMonitor
    });

    socket.on("halfPila", function (data) {
        console.log("HALF PILA REQUEST");
        try {
            console.log(1, "send");
            setTimeout(function () {
                deviceConnected.write("H");
            }, 2);
            console.log(2, "send");
            setTimeout(function () {
                deviceConnected.write("H");
            }, 2);
            console.log(3, "send");
            setTimeout(function () {
                deviceConnected.write("H");
            }, 2);
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
            console.log(1, "send");
            setTimeout(function () {
                deviceConnected.write("F");
            }, 2);
            console.log(2, "send");
            setTimeout(function () {
                deviceConnected.write("F");
            }, 2);
            console.log(3, "send");
            setTimeout(function () {
                deviceConnected.write("F");
            }, 2);
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


    socket.on("testThing", function (data) {
        console.log("HALF PILA REQUEST");
        try {
            console.log(1, "send");
            setTimeout(function () {
                deviceConnected.write("H");
            }, 2);
            console.log(2, "send");
            setTimeout(function () {
                deviceConnected.write("H");
            }, 2);
            console.log(3, "send");
            setTimeout(function () {
                deviceConnected.write("H");
            }, 2);
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

function newMonitorInfo(newString) {

    if (mensajesMonitor.length === 20) {
        mensajesMonitor.shift();
    }
    var fecha = new Date().getTime();

    var contenido = {
        fechaObjeto: fecha,
        contenido: newString
    }

    mensajesMonitor.push(contenido);

    io.emit("newDatafromTCP", {
        "data": mensajesMonitor
    });


}
//TCP server
net.createServer(function (connection) {

    console.log("*************NEW TCP CONNECTION**************");

    if (typeof deviceConnected === "undefined") {
        //if the connection is not on in the object, Add it to the deviceConnections object.
        deviceConnected = connection;
    } else {
        //If there is a connection with the same ID in the object, check if it is the same as this one.
        //If it is different close and destroy the previous one, and replace it with the new one.
        //Else do nothing.
        if (deviceConnected !== connection) {
            deviceConnected.destroy();
            deviceConnected = connection;
        }
    }

    connections_number++

    io.emit("newLevel", currentLevels);

    io.emit("connectionsUpdated", {
        "cantidad": connections_number
    });

    newMonitorInfo("NEW CONNECTION");

    connection.on('data', function (data) {

        console.log(1, "send");
        setTimeout(function () {
            connection.write("OOOOOOOOOOOOOOOOOOOOOOOO");
        }, 750);
        console.log(2, "send");
        setTimeout(function () {
            connection.write("OOOOOOOOOOOOOOOOOOOOOOOO");
        }, 750);
        console.log(3, "send");
        setTimeout(function () {
            connection.write("OOOOOOOOOOOOOOOOOOOOOOOO");
        }, 750);
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
//id=0001&r=13&p=34&

            newMonitorInfo(data_str);

            currentLevels.pila = telemetry_data.p;
            currentLevels.raincube = telemetry_data.r;

            io.emit("newLevel", currentLevels);
        }
    });

    connection.on('close', function () {
        console.log('TCP DEVICE DISCONNECTED.');
        connections_number--;

        newMonitorInfo("DEVICE DISCONNECTED");

        io.emit("connectionsUpdated", {
            "cantidad": connections_number
        });
    });

}).listen(TCP_PORT, function () {
    console.log('TCP Server Started.');
});

http.listen(3000, function () {
    console.log("Web Server Started.");
});

process.on("uncaughtException", function (err) {
    console.log("uncaughtException", err);
});
