document.addEventListener("DOMContentLoaded", () => {
    const cartTableBody = document.querySelector("#cart tbody");
    const cartTable = document.querySelector("#cart-table");
    const emptyCartMessage = document.querySelector("#empty-cart-message");
    const cartTotalSection = document.querySelector("#cart-total");
    const subtotalElem = document.querySelector("#subtotal");
    const totalElem = document.querySelector("#total");

    // Load cart from localStorage
    function loadCart() {
        const token = localStorage.getItem("token");
        if (!token) return [];

        const user = JSON.parse(sessionStorage.getItem("user"));
        if (!user || !user.customer_id) return [];

        const carts = JSON.parse(localStorage.getItem("cart")) || {};
        return carts[user.customer_id] || [];
    }

    let cart = loadCart();

    function saveCart(updatedCart) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        cart = updatedCart;
    }

    // Function to calculate total
    function calculateCartTotal() {
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const shipping = 10.00;
        let total = subtotal + shipping;

        subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
        totalElem.textContent = `$${total.toFixed(2)}`;

        // Store the total value in localStorage after calculation
        localStorage.setItem('total', total.toFixed(2));

        return total;
    }

    // Check if cart is empty or has items
    function renderCart() {
        cartTableBody.innerHTML = "";

        if (cart.length === 0) {
            cartTable.style.display = "none";
            emptyCartMessage.style.display = "block";
            cartTotalSection.style.display = "none";
            return;
        } else {
            cartTable.style.display = "table";
            emptyCartMessage.style.display = "none";
            cartTotalSection.style.display = "flex";
        }

        cart.forEach((item) => {
            const row = document.createElement("tr");
            const subtotal = item.price * item.quantity;

            row.innerHTML = `
                <td><a href="#" class="close-cart"><i class="fa-solid fa-remove"></i></a></td>
                <td><img src="${item.img}" alt="Product Image" style="width: 50px; height: 50px;"></td>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td><input type="number" name="Quantity" value="${item.quantity}" readonly style="width: 50px;"></td>
                <td class="subtotal">$${subtotal.toFixed(2)}</td>
            `;

            cartTableBody.appendChild(row);

            // Remove item event
            row.querySelector(".close-cart").addEventListener("click", (e) => {
                e.preventDefault();
                removeItem(item.name);
            });

            // Update quantity and subtotal
            const quantityInput = row.querySelector("input[name='Quantity']");
            quantityInput.addEventListener("change", () => {
                const newQuantity = parseInt(quantityInput.value, 10);
                if (newQuantity > 0) {
                    updateItem(item.name, newQuantity, row);
                } else {
                    quantityInput.value = 1;
                }
            });
        });

        calculateCartTotal();
    }

    // Function to remove item
    function removeItem(name) {
        const updatedCart = cart.filter((item) => item.name !== name);
        saveCart(updatedCart);
        renderCart();
    }

    // Function to update item quantity
    function updateItem(name, quantity, row) {
        const updatedCart = cart.map((item) => {
            if (item.name === name) {
                item.quantity = quantity;
                row.querySelector(".subtotal").textContent = `$${(item.price * quantity).toFixed(2)}`;
            }
            return item;
        });

        saveCart(updatedCart);
        calculateCartTotal();
    }

    // Initial render of the cart
    renderCart();

    console.log("Cart Data Before Sending:", cart);
});
