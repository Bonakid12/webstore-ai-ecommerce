// Function to load the navbar
function loadNavbar() {
    const navbarHTML = `
    <section id="header">
        <a href="index.html"><img src="img/logo.png" class="logo"></a>
        <div>
            <ul id="navbar">
                <li><a href="index.html">Home</a></li>
                <li><a href="shop.html">Shop</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="admin.html">Admin</a></li>
                <li id="lg-bag"><a href="cart.html"><i class="fa-solid fa-bag-shopping"></i></a></li>
                <li><a href="login.html"><i class="fa-regular fa-user"></i></a></li>
                <li><a ='#' id="logout-btn"><i class="fa-solid fa-arrow-right-from-bracket"></i></a></li>
                <a href="#" id="close"><i class="fa-solid fa-close"></i></a>
            </ul>
        </div>
        <div id="mobile">
            <a href="cart.html"><i class="fa-solid fa-bag-shopping"></i></a>
            <i id="bar" class="fa-solid fa-bars"></i>
        </div>
    </section>
    `;
    document.getElementById('navbar-container').innerHTML = navbarHTML;

    // Add navigation toggle functionality
    const bar = document.getElementById('bar');
    const nav = document.getElementById('navbar');
    const close = document.getElementById('close');

    if (bar) {
        bar.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
    if (close) {
        close.addEventListener('click', () => {
            nav.classList.remove('active');
        });
    }

    // Highlight the active link
    setActiveClass();
}

// Function to set the active class
function setActiveClass() {
    const currentPage = window.location.pathname.split('/').pop(); // Get current page
    const navLinks = document.querySelectorAll('#navbar a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Load the navbar after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadNavbar);


document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            sessionStorage.removeItem("user");
            localStorage.removeItem("cart"); // Clear cart on logout
            window.location.href = "/login.html";
        });
    }
});
