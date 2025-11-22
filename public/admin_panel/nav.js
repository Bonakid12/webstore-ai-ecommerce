function loadNavbar() {
    const navbarHTML = `
     <aside> 
            <div class="top">
                <div class="logo">
                    <img src="images/logo.png" alt="">
                    <h2>EGA<span class="danger">TOR</span></h2>
                </div>
              
                <div class="close" id="close-btn">
                        <span class="material-icons-sharp">close</span>
                </div>
            </div>
            <div class="sidebar">
                <a href="index.html" >
                    <span class="material-icons-sharp">dashboard</span>
                    <h3>Dashboard</h3>
                </a>
                <a href="customerpg.html" >
                    <span class="material-icons-sharp">person_outline</span>
                    <h3>Customers</h3>
                </a>
                <a href="orders.html">
                    <span class="material-icons-sharp">receipt_long</span>
                    <h3>Orders</h3>
                </a>
                <a href="Messages.html">
                    <span class="material-icons-sharp">mail_outline</span>
                    <h3>Messages</h3>
                    
                </a>
                <a href="add_product.html">
                    <span class="material-icons-sharp">inventory</span>
                    <h3>Products</h3>
                </a>
                <a href="discount.html">
                    <span class="material-icons-sharp">sell</span>
                    <h3>Discount</h3>
                </a>
                <a href="inventory.html" class="active">
                    <span class="material-icons-outlined">category</span>
                    <h3>Inventory</h3>
                </a>
                <a href="settings.html">
                    <span class="material-icons-sharp">settings</span>
                    <h3>Settings</h3>
                </a>
              
                <a onclick="logoutAdmin()">
                    <span class="material-icons-sharp">logout</span>
                    <h3>Logout</h3>
                </a>
            </div>
        </aside>
    `;
    document.getElementById('navbar-container').innerHTML = navbarHTML;
    const sideMenu = document.querySelector("aside");
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");
    const themetoggler = document.querySelector(".theme-toggler");
    
    // Only add event listeners if elements exist
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            sideMenu.style.display = "block";
            console.log('Menu button clicked: sidebar opened'); // Debugging
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            sideMenu.style.display = "none";
            console.log('Close button clicked: sidebar closed'); // Debugging
        });
    }
    
    if (themetoggler) {
        themetoggler.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme-variables");
            // Corrected selectors for theme toggler span
            themetoggler.querySelector('span:nth-child(1)').classList.toggle('active');
            themetoggler.querySelector('span:nth-child(2)').classList.toggle('active');
        });
    }
  



    setActiveClass();
}

function setActiveClass() {
    const currentPage = window.location.pathname.split('/').pop(); // Get current page
    const navLinks = document.querySelectorAll('.sidebar a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function logoutAdmin() {
    localStorage.removeItem("adminToken");
    window.location.href = "../admin.html";
  }
  
document.addEventListener('DOMContentLoaded', loadNavbar);


 