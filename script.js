// Function to parse URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("availabilityForm")) {
        document.getElementById("availabilityForm").addEventListener("submit", function(event) {
            event.preventDefault();
            var checkInDate = document.getElementById("checkInDate").value;
            var checkOutDate = document.getElementById("checkOutDate").value;
            window.location.href = `results.html?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
        });
    } else if (document.getElementById("availableRooms")) {
        var checkInDate = getUrlParameter('checkInDate');
        var checkOutDate = getUrlParameter('checkOutDate');

        fetch(`http://localhost:8080/rooms/available?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`)
            .then(response => response.json())
            .then(data => {
                var availableRoomsHTML = "";
                if (data.length === 0) {
                    availableRoomsHTML = "<p>No available rooms for the selected dates.</p>";
                } else {
                    availableRoomsHTML += "<h2>Available Rooms</h2>";
                    data.forEach(room => {
                        availableRoomsHTML += `<p>Room ID: ${room.roomId}, Room Type: ${room.type}, Room Price: ${room.price}</p>`;
                    });
                }
                document.getElementById("availableRooms").innerHTML = availableRoomsHTML;
            })
            .catch(error => console.error('Error:', error));
    }
});
