document.addEventListener("DOMContentLoaded", function () {
    // Function to parse URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    function isDateInFuture(date) {
        var selectedDate = new Date(date);
        var today = new Date();

        // Set the hours, minutes, seconds and milliseconds to 0 for both dates
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return selectedDate >= today;
    }

    function isCheckOutDateAfterCheckInDate(checkInDate, checkOutDate) {
        var checkIn = new Date(checkInDate);
        var checkOut = new Date(checkOutDate);

        // Set the hours, minutes, seconds and milliseconds to 0 for both dates
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        return checkOut > checkIn;
    }

    // Handling index.html form submission
    if (document.getElementById("availabilityForm")) {
        document.getElementById("availabilityForm").addEventListener("submit", function (event) {
            event.preventDefault();
            var checkInDate = document.getElementById("checkInDate").value;
            var checkOutDate = document.getElementById("checkOutDate").value;
            if (!isDateInFuture(checkInDate) || !isDateInFuture(checkOutDate)) {
                alert("Please select a date in the future.");
                return;
            }
            if (!isCheckOutDateAfterCheckInDate(checkInDate, checkOutDate)) {
                alert("Check-out date must be after check-in date.");
                return;
            }

            var numberOfPersons = document.getElementById("numberOfPersons").value;
            window.location.href = `results.html?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&numberOfPersons=${numberOfPersons}`;
        });
    }

    // Handling results.html
    if (document.getElementById("availableRooms")) {
        var checkInDate = getUrlParameter('checkInDate');
        var checkOutDate = getUrlParameter('checkOutDate');
        var numberOfPersons = getUrlParameter('numberOfPersons');

        fetch(`http://localhost:8080/rooms/available?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`)
            .then(response => response.json())
            .then(data => {
                var roomsByCategory = {};
                data.forEach(room => {
                    if (!roomsByCategory[room.type]) {
                        roomsByCategory[room.type] = { rooms: [], price: room.price };
                    }
                    roomsByCategory[room.type].rooms.push(room);
                });

                var availableRoomsHTML = "";
                if (Object.keys(roomsByCategory).length === 0) {
                    availableRoomsHTML = "<p>No available rooms for the selected dates.</p>";
                } else {
                    availableRoomsHTML += "<h2>Available Rooms</h2>";
                    for (const [type, details] of Object.entries(roomsByCategory)) {
                        availableRoomsHTML += `<h3>${type.charAt(0) + type.slice(1).toLowerCase()}</h3>`;
                        availableRoomsHTML += `<p>${details.rooms.length} rooms available</p>`;
                        availableRoomsHTML += `<p>Room Price: ${details.price} - <a href="summary.html?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomId=${details.rooms[0].roomId}&roomType=${type}&roomPrice=${details.price}&numberOfPersons=${numberOfPersons}">Choose</a></p>`;
                    }
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
        var numberOfPersons = getUrlParameter('numberOfPersons');

        document.getElementById("summary").innerHTML = `<h2>Room Summary</h2>
            <p>Check-in Date: ${checkInDate}</p>
            <p>Check-out Date: ${checkOutDate}</p>
            <p>Room Type: ${roomType}</p>
            <p>Room Price: ${roomPrice}</p>
            <p>Number of Persons: ${numberOfPersons}</p>`;

        document.getElementById("customerForm").addEventListener("submit", function (event) {
            event.preventDefault();
            var firstName = document.getElementById("firstName").value;
            var lastName = document.getElementById("lastName").value;

            var reservationData = {
                checkinDate: checkInDate,
                checkoutDate: checkOutDate,
                numberOfPersons: numberOfPersons,
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
                    window.location.href = `confirmation.html?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}&roomPrice=${roomPrice}&firstName=${firstName}&lastName=${lastName}&numberOfPersons=${numberOfPersons}&reservationId=${data.reservationId}&bookingId=${data.bookingId}&totalPrice=${data.totalPrice}`;
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
        var numberOfPersons = getUrlParameter('numberOfPersons');
        var bookingId = getUrlParameter('bookingId');
        var totalPrice = parseFloat(getUrlParameter('totalPrice'));

        document.getElementById("confirmation").innerHTML = `<h2>Booking Confirmation</h2>
            <p>Thank you, ${firstName} ${lastName}!</p>
            <p>Your booking details:</p>
            <p>Check-in Date: ${checkInDate}</p>
            <p>Check-out Date: ${checkOutDate}</p>
            <p>Room Type: ${roomType}</p>
            <p>Room Price: ${roomPrice}</p>
            <p>Number of Persons: ${numberOfPersons}</p>
            <p>Total Price: ${totalPrice}</p>
            <p>Booking ID: ${bookingId}</p>`;
    }
});

