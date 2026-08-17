let defaultProducts=[
 {id:1,name:"Self Adhesive Wall Hooks - Pack of 2",price:199,mrp:299,image:"https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=80"},
 {id:2,name:"Kitchen Utility Organizer",price:249,mrp:399,image:"https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80"}
];

let products = JSON.parse(localStorage.getItem("sale11_products")) || defaultProducts;
let cart=JSON.parse(localStorage.getItem("sale11cart")||"[]");

function renderProducts(){
 const q=(document.getElementById("search").value||"").toLowerCase();
 document.getElementById("products").innerHTML=products.filter(p=>p.name.toLowerCase().includes(q)).map(p=>`
 <article class="card"><img src="${p.image}" alt="${p.name}"><div class="info">
 <div class="name">${p.name}</div><div class="price">₹${p.price} <span class="mrp">₹${p.mrp}</span></div>
 <button class="primary" onclick="addToCart(${p.id})">Add to Cart</button></div></article>`).join("");
}

function openAdmin(){
  let password = prompt("Enter Admin Password:");
  if (password === "1235") {
    document.getElementById("adminModal").classList.remove("hidden");
  } else if (password !== null) {
    alert("Wrong Password!");
  }
}

function closeAdmin(){
 document.getElementById("adminModal").classList.add("hidden");
}

function addNewProduct(){
 let name = document.getElementById("prodName").value.trim();
 let price = Number(document.getElementById("prodPrice").value);
 let mrp = Number(document.getElementById("prodMrp").value);
 let image = document.getElementById("prodImg").value.trim();

 if(!name || !price || !image){
   alert("Please fill all required product fields.");
   return;
 }

 let newId = products.length ? products[products.length - 1].id + 1 : 1;
 products.push({id: newId, name, price, mrp: mrp || price, image});
 localStorage.setItem("sale11_products", JSON.stringify(products));
 renderProducts();
 closeAdmin();
 alert("Product added successfully!");
}

function addToCart(id){
 let p=products.find(x=>x.id===id);
 let x=cart.find(x=>x.id===id);
 if(x)x.qty++;
 else cart.push({...p,qty:1});
 save();
 openCart();
}

function save(){
 localStorage.setItem("sale11cart",JSON.stringify(cart));
 document.getElementById("cartCount").textContent=cart.reduce((a,x)=>a+x.qty,0);
}

function openCart(){
 document.getElementById("cartModal").classList.remove("hidden");
 renderCart();
}

function closeCart(){
 document.getElementById("cartModal").classList.add("hidden");
}

function renderCart(){
 document.getElementById("cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cartRow"><img src="${x.image}"><div><b>${x.name}</b><br>₹${x.price} × ${x.qty}<br><button onclick="removeItem(${x.id})">Remove</button></div></div>`).join(""):"<p>Your cart is empty.</p>";
 document.getElementById("cartTotal").textContent=cart.reduce((a,x)=>a+x.price*x.qty,0);
}

function removeItem(id){
 cart=cart.filter(x=>x.id!==id);
 save();
 renderCart();
}

function checkout(){
 if(!cart.length)return;
 document.getElementById("checkoutTotal").textContent=cart.reduce((a,x)=>a+x.price*x.qty,0);
 closeCart();
 document.getElementById("checkoutModal").classList.remove("hidden");
}

function closeCheckout(){
 document.getElementById("checkoutModal").classList.add("hidden");
}

function placeOrder(){
 let name=document.getElementById("name").value.trim(),
     phone=document.getElementById("phone").value.trim(),
     address=document.getElementById("address").value.trim(),
     pin=document.getElementById("pincode").value.trim();

 if(!name||!phone||!address||!pin){
  alert("Please fill all delivery details.");
  return;
 }

 let total = cart.reduce((a,x)=>a+x.price*x.qty,0);
 let orderId = "S11-" + Date.now();
 let itemsList = cart.map(x => `• ${x.name} (Qty: ${x.qty}) - ₹${x.price * x.qty}`).join("\n");

 let message = `New Order: ${orderId}\n` +
               `Name: ${name}\n` +
               `Phone: ${phone}\n` +
               `Address: ${address} - ${pin}\n\n` +
               `Items:\n${itemsList}\n\n` +
               `Total: ₹${total}`;

 let whatsappNumber = "918779165289";

 cart=[];
 save();
 closeCheckout();

 window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
}

renderProducts();
save();
