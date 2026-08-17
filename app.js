let defaultProducts = [
  {id:1, name:"Self Adhesive Wall Hooks", price:199, mrp:299,
   desc:"Premium quality wall hooks, easy to install, no drilling needed.",
   image:"https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=80"}
];

let products = JSON.parse(localStorage.getItem("sale11_products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("sale11cart") || "[]");
let selectedPid = null;

function saveProducts() {
  localStorage.setItem("sale11_products", JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem("sale11cart", JSON.stringify(cart));
}

function renderProducts(){
  const box = document.getElementById("products");
  box.innerHTML = products.map(p => `
    <article class="card" onclick="viewDetail(${p.id})">
      <img src="${p.image}" alt="${escapeHtml(p.name)}">
      <div class="info">
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="price">₹${p.price} <span class="mrp">₹${p.mrp}</span></div>
      </div>
    </article>
  `).join("");
  updateCartCount();
}

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function viewDetail(id){
  let p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById("detailImg").src = p.image;
  document.getElementById("detailName").innerText = p.name;
  document.getElementById("detailDesc").innerText = p.desc || "";
  document.getElementById("detailPrice").innerText = p.price;
  document.getElementById("detailModal").classList.remove("hidden");
  selectedPid = id;
}

function addNewProduct(){
  let name = document.getElementById("prodName").value.trim();
  let desc = document.getElementById("prodDesc").value.trim();
  let price = Number(document.getElementById("prodPrice").value);
  let mrp = Number(document.getElementById("prodMrp").value);
  let image = document.getElementById("prodImg").value.trim();

  if (!name || !price || !image) {
    alert("Product Name, Price aur Image URL zaroor bhariye.");
    return;
  }

  products.push({
    id: Date.now(),
    name,
    desc,
    price,
    mrp: mrp || price,
    image
  });

  saveProducts();
  renderProducts();
  clearProductForm();
  closeAdmin();
}

function clearProductForm() {
  document.getElementById("prodName").value = "";
  document.getElementById("prodDesc").value = "";
  document.getElementById("prodPrice").value = "";
  document.getElementById("prodMrp").value = "";
  document.getElementById("prodImg").value = "";
}

function addToCartFromDetail(){
  if (selectedPid === null) return;
  const product = products.find(x => x.id === selectedPid);
  if (!product) return;

  cart.push(product);
  saveCart();
  updateCartCount();
  closeDetail();
  alert("Product cart mein add ho gaya.");
}

function updateCartCount(){
  document.getElementById("cartCount").innerText = cart.length;
}

function openCart(){
  renderCart();
  document.getElementById("cartModal").classList.remove("hidden");
}

function closeCart(){
  document.getElementById("cartModal").classList.add("hidden");
}

function renderCart(){
  const box = document.getElementById("cartItems");

  if (cart.length === 0) {
    box.innerHTML = "<p>Cart abhi empty hai.</p>";
    document.getElementById("cartTotal").innerText = "0";
    return;
  }

  box.innerHTML = cart.map((p, index) => `
    <div class="cart-row">
      <img src="${p.image}" alt="">
      <div>
        <b>${escapeHtml(p.name)}</b>
        <div>₹${p.price}</div>
      </div>
      <button onclick="removeFromCart(${index})">Remove</button>
    </div>
  `).join("");

  const total = cart.reduce((sum, p) => sum + Number(p.price || 0), 0);
  document.getElementById("cartTotal").innerText = total;
}

function removeFromCart(index){
  cart.splice(index, 1);
  saveCart();
  updateCartCount();
  renderCart();
}

function openAdmin(){
  document.getElementById("adminModal").classList.remove("hidden");
}

function closeAdmin(){
  document.getElementById("adminModal").classList.add("hidden");
}

function closeDetail(){
  document.getElementById("detailModal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", renderProducts);
