let products = [
  { name: "Cartoon Astronaut T-shirts", price: 50.00, image: "img/products/f1.jpg" },
  { name: "Cartoon Astronaut T-shirts", price: 50.00, image: "img/products/f2.jpg" },
  // Add more products here
];

function createProductCard(name, price, image) {
  return `
  <div class="product" onclick="location.href='sproductpage.html';">
      <img src="${image}">
      <div class="description">
          <span>Adidas</span>
          <h5>${name}</h5>
          <div class="star">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
          </div>
          <h4>$${price}</h4>
      </div>
      <a href="#" class="cart-btn"><i class="fa-solid fa-cart-plus cart"></i></a>
  </div>
  `;
}

function loadProducts() {
  const productContainer = document.querySelector(".product-box");
  productContainer.innerHTML = ""; // Clear existing products
  products.forEach(product => {
      productContainer.innerHTML += createProductCard(product.name, product.price, product.image);
  });
}

function addNewProduct(name, price, image) {
  products.push({ name, price, image });
  localStorage.setItem('products', JSON.stringify(products)); // Save products to localStorage
  loadProducts(); // Refresh the product list
}

// Load the products after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const savedProducts = JSON.parse(localStorage.getItem('products'));
  if (savedProducts) {
      products = savedProducts;
  }
  loadProducts();
});
