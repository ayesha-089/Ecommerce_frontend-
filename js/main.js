const money = (amount) => "Rs. " + Number(amount).toLocaleString("en-PK");
const getCart = () => JSON.parse(localStorage.getItem("havenCart") || "[]");
const saveCart = (cart) => { localStorage.setItem("havenCart", JSON.stringify(cart)); updateCartCount(); };
const findProduct = (id) => window.PRODUCTS.find((product) => product.id === Number(id));

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((node) => node.textContent = count);
}
function addToCart(id, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === Number(id));
  if (existing) existing.quantity += quantity;
  else cart.push({ id: Number(id), quantity });
  saveCart(cart);
  alert("Added to your cart!");
}
function productCard(product) {
  return `<article class="product-card">
    <a class="product-image" href="product.html?id=${product.id}">
      <div class="art ${product.art}" aria-hidden="true">${product.icon}</div>
      ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
    </a>
    <div class="product-info"><span class="product-category">${product.category}</span>
      <h3><a href="product.html?id=${product.id}">${product.name}</a></h3><span class="price">${money(product.price)}</span>
    </div>
    <button class="quick-add" type="button" data-add="${product.id}">+ Add to cart</button>
  </article>`;
}
function renderProducts(target, products) {
  const element = document.querySelector(target);
  if (element) element.innerHTML = products.map(productCard).join("");
}
function setupProductPage() {
  const target = document.querySelector("#product-detail");
  if (!target) return;
  const id = new URLSearchParams(location.search).get("id") || 1;
  const product = findProduct(id) || window.PRODUCTS[0];
  target.innerHTML = `<div class="detail-art ${product.art}" aria-label="${product.name} product illustration">${product.icon}</div>
    <div class="detail-info"><p class="eyebrow">${product.category.toUpperCase()}</p><h1>${product.name}</h1><p class="price">${money(product.price)}</p>
    <p class="detail-description">${product.description}</p><div class="quantity-row"><label for="detail-quantity">Quantity</label><input id="detail-quantity" type="number" min="1" max="10" value="1"></div>
    <button class="btn" type="button" data-add="${product.id}" id="detail-add">Add to cart</button>
    <p class="detail-meta">✓ Carefully selected · ✓ Easy everyday styling · ✓ Demo product listing</p></div>`;
  document.querySelector("#detail-add").addEventListener("click", () => {
    const quantity = Math.max(1, Math.min(10, Number(document.querySelector("#detail-quantity").value) || 1));
    addToCart(product.id, quantity);
  });
}
function renderCart() {
  const list = document.querySelector("#cart-items");
  const summary = document.querySelector("#cart-summary");
  if (!list || !summary) return;
  const cart = getCart();
  if (!cart.length) {
    list.innerHTML = `<div class="empty-state"><h2>Your cart is waiting</h2><p>Looks like you have not added anything yet.</p><a class="btn" href="products.html">Explore products</a></div>`;
    summary.innerHTML = `<h2>Order summary</h2><p class="muted">Your items and total will appear here.</p>`;
    return;
  }
  list.innerHTML = cart.map((item) => {
    const p = findProduct(item.id);
    if (!p) return "";
    return `<article class="cart-row"><div class="cart-thumb">${p.icon}</div><div><h3>${p.name}</h3><p>${money(p.price)} each</p><div class="cart-controls"><button type="button" data-qty="-1" data-id="${p.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-qty="1" data-id="${p.id}" aria-label="Increase quantity">+</button><button type="button" class="remove-item" data-remove="${p.id}">Remove</button></div></div><strong>${money(p.price * item.quantity)}</strong></article>`;
  }).join("");
  const subtotal = cart.reduce((sum, item) => { const p = findProduct(item.id); return sum + (p ? p.price * item.quantity : 0); }, 0);
  const shipping = subtotal >= 5000 ? 0 : 250;
  summary.innerHTML = `<h2>Order summary</h2><div class="summary-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-line"><span>Delivery</span><strong>${shipping ? money(shipping) : "Free"}</strong></div><div class="summary-line summary-total"><span>Total</span><strong>${money(subtotal + shipping)}</strong></div><a class="btn btn-full" href="checkout.html">Continue to checkout</a><p class="muted" style="font-size:.75rem;margin-top:1rem">Demo checkout only. No payment is processed.</p>`;
}
function renderCheckoutSummary() {
  const target = document.querySelector("#checkout-summary");
  if (!target) return;
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => { const p = findProduct(item.id); return sum + (p ? p.price * item.quantity : 0); }, 0);
  const shipping = subtotal >= 5000 || subtotal === 0 ? 0 : 250;
  target.innerHTML = cart.length ? cart.map((item) => { const p = findProduct(item.id); return p ? `<div class="summary-line"><span>${p.name} × ${item.quantity}</span><strong>${money(p.price * item.quantity)}</strong></div>` : ""; }).join("") + `<div class="summary-line"><span>Delivery</span><strong>${shipping ? money(shipping) : "Free"}</strong></div><div class="summary-line summary-total"><span>Total</span><strong>${money(subtotal + shipping)}</strong></div>` : `<p class="muted">Your cart is empty. <a href="products.html">Browse products</a>.</p>`;
}
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  const menu = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (menu && nav) menu.addEventListener("click", () => { const open = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); });

  renderProducts("#featured-products", window.PRODUCTS.slice(0, 4));
  const shopTarget = document.querySelector("#all-products");
  if (shopTarget) {
    let category = new URLSearchParams(location.search).get("category") || "All";
    const renderShop = () => {
      let products = category === "All" ? [...window.PRODUCTS] : window.PRODUCTS.filter(p => p.category === category);
      const sort = document.querySelector("#sort-products")?.value;
      if (sort === "low") products.sort((a,b) => a.price-b.price);
      if (sort === "high") products.sort((a,b) => b.price-a.price);
      renderProducts("#all-products", products);
      document.querySelectorAll(".filter-chip").forEach(btn => btn.classList.toggle("active", btn.dataset.category === category));
    };
    document.querySelectorAll(".filter-chip").forEach(btn => btn.addEventListener("click", () => { category = btn.dataset.category; renderShop(); }));
    document.querySelector("#sort-products")?.addEventListener("change", renderShop);
    renderShop();
  }
  setupProductPage();
  renderCart();
  renderCheckoutSummary();

  document.body.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    if (add && add.id !== "detail-add") addToCart(add.dataset.add);
    const remove = event.target.closest("[data-remove]");
    if (remove) { saveCart(getCart().filter(item => item.id !== Number(remove.dataset.remove))); renderCart(); }
    const qty = event.target.closest("[data-qty]");
    if (qty) {
      const cart = getCart();
      const item = cart.find(row => row.id === Number(qty.dataset.id));
      if (item) item.quantity = Math.max(1, Math.min(10, item.quantity + Number(qty.dataset.qty)));
      saveCart(cart); renderCart();
    }
  });

  document.querySelector("#checkout-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = form.querySelector(".form-message");
    if (!form.checkValidity()) { form.reportValidity(); message.textContent = "Please complete all required fields correctly."; message.className = "form-message error"; return; }
    if (!getCart().length) { message.textContent = "Your cart is empty. Add a product before checkout."; message.className = "form-message error"; return; }
    message.textContent = "Order details are valid! This is a demo — no payment or order was sent."; message.className = "form-message success";
    localStorage.removeItem("havenCart"); updateCartCount(); renderCheckoutSummary();
  });
  document.querySelectorAll(".demo-form").forEach(form => form.addEventListener("submit", event => {
    event.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; }
    const msg = form.querySelector(".form-message"); msg.textContent = "Success! Form validation passed (demo only)."; msg.className = "form-message success";
  }));
  document.querySelector("#newsletter-form")?.addEventListener("submit", event => {
    event.preventDefault(); if (event.currentTarget.checkValidity()) alert("Thanks for joining our demo newsletter!");
  });
});
