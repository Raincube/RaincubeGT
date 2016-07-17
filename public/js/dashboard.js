$(document).ready(function () {

    // Add scrollspy to <body>
    $('body').scrollspy({
        target: ".navbar",
        offset: 50
    });

    // Add smooth scrolling on all links inside the navbar
    $("#myNavbar a").on('click', function (event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 250, function () {

                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        } // End if
    });
});

var socket = io();

socket.on("connect", function () {
    console.log("connected to socket.io");
});

socket.on("disconnect", function () {
    console.log("disconnected from socket.io");
});

socket.on("reconnect", function () {
    console.log("reconnected to socket.io");
});


function fullPila() {
    socket.emit("fullPila");
}

function halfPila() {
    socket.emit("halfPila");
}

socket.on("pilaRequest", function (data){
    if (data.success === true) {

    } else {
        alert("No se pudo comunicar con el equipo. Verifique conexión.");
    }
});

socket.on("newLevel", function (levels){
    $("#raincubeBar").css('width', levels.raincube+'%').attr('aria-valuenow', levels.raincube);
    $("#pilaBar").css('width', levels.pila+'%').attr('aria-valuenow', levels.raincube);

//    $("#raincubeBar").text(levels.raincube + " %");
//    $("#pilaBar").text(levels.raincube + " %");


});


