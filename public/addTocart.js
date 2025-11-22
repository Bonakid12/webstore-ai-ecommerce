document.addEventListener("DOMContentLoaded", () => {
    const productDetails = document.querySelector("#product-details");
    const cartBtn = productDetails.querySelector(".add-to-cart");

    // Get product ID from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')); // Assuming the URL is like 'productpage.html?id=123'

    cartBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please log in to add items to the cart.");
            return;
        }

        const user = JSON.parse(sessionStorage.getItem("user"));
        if (!user || !user.customer_id) {
            alert("User data not found. Please log in again.");
            return;
        }

        const name = productDetails.querySelector(".name").textContent;
        const price = parseFloat(productDetails.querySelector(".price").textContent.replace("$", ""));
        const quantity = parseInt(productDetails.querySelector(".quantity").value, 10);
        const img = productDetails.querySelector("#Main-image").src;

        // Get selected size (assuming there's a dropdown or radio buttons for size selection)
        const size = productDetails.querySelector("#product-size").value;  // Example for a dropdown

        if (!name || !price || !img || !quantity || quantity <= 0 || !size) {
            alert("Invalid product details. Please check the inputs.");
            return;
        }

        // Check stock availability
        const stockAvailable = await checkStockAvailability(productId, size, quantity);
        if (!stockAvailable) {
            alert("Sorry, not enough stock available.");
            return;
        }

        // Proceed to add to cart
        addToCart(user.customer_id, name, price, img, quantity, productId, size);
        alert("Item added to cart!");
    });

    async function checkStockAvailability(productId, size, quantity) {
        try {
            const response = await fetch(`/inventory/check-stock/${productId}?size=${size}`);
            const data = await response.json();
            if (data.stock_quantity >= quantity) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error checking stock:", error);
            return false;
        }
    }

    function addToCart(userId, name, price, img, quantity, productId, size) {
        const cart = JSON.parse(localStorage.getItem("cart")) || {};
        const userCart = cart[userId] || [];

        const itemIndex = userCart.findIndex((item) => item.name === name && item.size === size);
        if (itemIndex >= 0) {
            userCart[itemIndex].quantity += quantity;
        } else {
            userCart.push({ name, price, img, quantity, productId, size });
        }

        cart[userId] = userCart;
        localStorage.setItem("cart", JSON.stringify(cart));

        // Update stock in the inventory
        updateStock(productId, size, quantity);
    }

    async function updateStock(productId, size, quantity) {
        try {
            await fetch(`/inventory/update-stock/${productId}?size=${size}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
        } catch (error) {
            console.error("Error updating stock:", error);
        }
    }
});
