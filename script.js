// Function to parse URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

document.addEventListener("DOMContentLoaded", function() {
    // Handling index.html form submission
    if (document.getElementById("availabilityForm")) {
        document.getElementById("availabilityForm").addEventListener("submit", function(event) {
            event.preventDefault();
            var checkInDate = document.getElementById("checkInDate").value;
            var checkOutDate = document.getElementById("checkOutDate").value;
            window.location.href = `results.html?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
        });
    }

    // Handling results.html
    if (document.getElementById("availableRooms")) {
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
                        availableRoomsHTML += `<p>Room Type: ${room.type}, Room Price: ${room.price} - <a href="summary.html?checkInDate=${checkInDate}
                        &checkOutDate=${checkOutDate}&roomId=${room.roomId}&roomType=${room.type}&roomPrice=${room.price}">Choose</a></p>`;
                    });
                }
                document.getElementById("availableRooms").innerHTML = availableRoomsHTML;
            })
            .catch(error => console.error('Error:', error));
    }

    // Handling summary.html
    if (document.getElementById("summary")) {
        var checkInDate = getUrlParameter('checkInDate');
        var checkOutDate = getUrlParameter('checkOutDate');
        var roomId = getUrlParameter('roomId');
        var roomType = getUrlParameter('roomType');
        var roomPrice = getUrlParameter('roomPrice');

        document.getElementById("summary").innerHTML = `<h2>Room Summary</h2>
            <p>Check-in Date: ${checkInDate}</p>
            <p>Check-out Date: ${checkOutDate}</p>
            <p>Room Type: ${roomType}</p>
            <p>Room Price: ${roomPrice}</p>`;

        document.getElementById("customerForm").addEventListener("submit", function(event) {
            event.preventDefault();
            var firstName = document.getElementById("firstName").value;
            var lastName = document.getElementById("lastName").value;

            var reservationData = {
                checkinDate: checkInDate,
                checkoutDate: checkOutDate,
                numberOfPersons: 2, // Assuming a static value, you may want to make this dynamic
                customer: {
                    name: firstName,
                    lastName: lastName
                },
                room: {
                    type: roomType,
                    price: roomPrice,
                    roomId: roomId
                }
            };

            fetch('http://localhost:8080/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            })
                .then(response => response.json())
                .then(data => {
                    window.location.href = `confirmation.html?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}
                &roomPrice=${roomPrice}&firstName=${firstName}&lastName=${lastName}&reservationId=${data.reservationId}&bookingId=${data.bookingId}&totalPrice=${data.totalPrice}`;
                })
                .catch(error => console.error('Error:', error));
        });
    }

    // Handling confirmation.html
    if (document.getElementById("confirmation")) {
        var checkInDate = getUrlParameter('checkInDate');
        var checkOutDate = getUrlParameter('checkOutDate');
        var roomType = getUrlParameter('roomType');
        var roomPrice = parseFloat(getUrlParameter('roomPrice'));
        var firstName = getUrlParameter('firstName');
        var lastName = getUrlParameter('lastName');
        var bookingId = getUrlParameter('bookingId');
        var totalPrice = parseFloat(getUrlParameter('totalPrice'));

        document.getElementById("confirmation").innerHTML = `<h2>Booking Confirmation</h2>
            <p>Thank you, ${firstName} ${lastName}!</p>
            <p>Your booking details:</p>
            <p>Check-in Date: ${checkInDate}</p>
            <p>Check-out Date: ${checkOutDate}</p>
            <p>Room Type: ${roomType}</p>
            <p>Room Price: ${roomPrice}</p>
            <p>Total Price: ${totalPrice}</p>
            <p>Booking ID: ${bookingId}</p>`;
    }
});
