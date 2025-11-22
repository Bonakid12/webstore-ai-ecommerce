function loadFooter() {
    const footerHTML = `
    <footer class="section-p1">
        <div class="col">
            <img src="img/logo.png" class="logo">
            <h4>Contact</h4>
            <p><strong>Address:</strong> Wellington Road, Street 32, San Francisco</p>
            <p><strong>Phone:</strong> +01 2222 365 / (+91) 01 2345 6789</p>
            <p><strong>Hours:</strong> 10:00 - 18:00, Mon - Sat</p>
            <div class="follow">
                <h4>Follow us</h4>
                <div class="icon">
                    <a href="#"><i class="fa-brands fa-facebook"></i></a>
                    <a href="#"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#"><i class="fa-brands fa-tiktok"></i></a>
                    <a href="#"><i class="fa-brands fa-youtube"></i></a>
                    <a href="#"><i class="fa-brands fa-pinterest"></i></a>
                </div>
            </div>
        </div>
        <div class="col">
            <h4>About</h4>
            <a href="about.html">About Us</a>
            <a href="help+info+policy.html">Delivery Information</a>
            <a href="help+info+policy.html">Privacy Policy</a>
            <a href="help+info+policy.html">Terms & Condition</a>
            <a href="contact.html">Contact Us</a>
        </div>
        <div class="col">
            <h4>My Account</h4>
            <a href="login.html">Sign In</a>
            <a href="cart.html">View Cart</a>
            <a href="wishlist.html">My Wishlist</a>
            <a href="track-order.html">Track My Order</a>
            <a href="#">Help</a>
        </div>
        <div class="col install">
            <h4>Install App</h4>
            <p>From App Store or Google Play</p>
            <div class="row">
                <a href="#"><img src="img/pay/app.jpg"></a>
                <a href="#"><img src="img/pay/play.jpg"></a>
            </div>
            <p>Secured Payment Gateways</p>
            <img src="img/pay/pay.png">
        </div>
        <div class="copyright">
            <p>© 2025 Smass7. All Rights Reserved</p>
        </div>
    </footer>
    `;
    document.getElementById('footer-container').innerHTML = footerHTML;
}

// Load the footer after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadFooter);
