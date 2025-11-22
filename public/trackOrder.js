document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem("token"); // Get token from local storage

    if (!token) {
        // If no token, the user can't access this page
        document.getElementById("order-message").textContent = "Please log in to track your order.";
        return;
    }

    // Decode the token to get customer_id (assuming it's a JSON Web Token)
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Assuming token is JWT
    const customerId = decodedToken.customer_id; // Extract customer_id

    // Fetch the order details for the customer from the server
    try {
        const response = await fetch('/trackorder/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Pass the token in Authorization header
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch orders.");
        }

        const orders = await response.json(); // Assuming the response is in JSON format

        if (orders.length === 0) {
            document.getElementById("order-message").textContent = "You have no orders yet.";
            return;
        }

        // Display order details
        const orderTable = document.getElementById("order-table").querySelector("tbody");
        orders.forEach(order => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td data-label="Order Date">${new Date(order.order_date).toLocaleDateString()}</td>
                <td data-label="Tracking Number">${order.tracking_number}</td>
                <td data-label="Address">${order.shipping_address}</td>
            `;
            orderTable.appendChild(row);
        });

        // Show the order details section
        document.getElementById("order-details").style.display = "block";
        document.getElementById("order-message").style.display = "none";
    } catch (error) {
        document.getElementById("order-message").textContent = "An error occurred. Please try again later.";
        console.error(error);
    }
});
