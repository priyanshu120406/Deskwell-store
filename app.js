const PRODUCTS=[
{id:1,n:"Mechanical keyboard",c:"Keyboards",p:4499,o:5499,e:"⌨️",r:4.6,s:"Hot-swap switches, 75% layout"},
{id:2,n:"Wireless mouse",c:"Accessories",p:1299,o:1599,e:"🖱️",r:4.4,s:"Silent clicks, 12-month battery"},
{id:3,n:"Desk lamp",c:"Lighting",p:1899,o:2299,e:"💡",r:4.5,s:"Warm to cool, touch dimmer"},
{id:4,n:"Noise-cancelling headphones",c:"Audio",p:6999,o:8999,e:"🎧",r:4.7,s:"40-hour battery, USB-C"},
{id:5,n:"Laptop stand",c:"Accessories",p:999,o:1299,e:"💻",r:4.3,s:"Aluminium, folds flat"},
{id:6,n:"Webcam 1080p",c:"Accessories",p:2499,o:2999,e:"📷",r:4.2,s:"Autofocus, privacy shutter"},
{id:7,n:"Bluetooth speaker",c:"Audio",p:2199,o:2799,e:"🔊",r:4.4,s:"IPX5, 12-hour playtime"},
{id:8,n:"Monitor light bar",c:"Lighting",p:2799,o:3299,e:"🔆",r:4.6,s:"No screen glare, USB powered"},
{id:9,n:"Compact keyboard",c:"Keyboards",p:1799,o:2199,e:"🎹",r:4.1,s:"Low profile, 3-device pairing"},
{id:10,n:"USB-C hub 7-in-1",c:"Accessories",p:1999,o:2599,e:"🔌",r:4.5,s:"HDMI 4K, SD card, 100W pass-through"},
{id:11,n:"Earbuds",c:"Audio",p:1599,o:2199,e:"🎵",r:4.0,s:"Low latency, 24-hour case"},
{id:12,n:"Desk mat XL",c:"Accessories",p:799,o:999,e:"🟦",r:4.3,s:"Water resistant, stitched edges"}
];
const FREE_AT=2999;
const rs=n=>"₹"+n.toLocaleString("en-IN");
const $=id=>document.getElementById(id);
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
let state={cat:"All",q:"",sort:"feat",cart:store.get("dw_cart",[]),user:store.get("dw_user",null),coupon:null};
const save=()=>{store.set("dw_cart",state.cart);store.set("dw_user",state.user)};

function toast(t){const el=$("toast");el.textContent=t;el.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("on"),1800)}

function renderCats(){
  const cats=["All",...new Set(PRODUCTS.map(p=>p.c))];
  $("cats").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===state.cat}" data-c="${c}">${c}</button>`).join("");
}
function renderGrid(){
  let list=PRODUCTS.filter(p=>(state.cat==="All"||p.c===state.cat)&&p.n.toLowerCase().includes(state.q.toLowerCase()));
  if(state.sort==="low")list.sort((a,b)=>a.p-b.p);
  if(state.sort==="high")list.sort((a,b)=>b.p-a.p);
  if(state.sort==="rate")list.sort((a,b)=>b.r-a.r);
  $("grid").innerHTML=list.length?list.map(p=>`<article class="card"><div class="pic" aria-hidden="true">${p.e}</div><div class="b"><h3>${p.n}</h3><div class="meta">${p.s}</div><div class="meta">★ ${p.r}</div><div class="price">${rs(p.p)}<s>${rs(p.o)}</s></div><button class="btn primary" data-add="${p.id}">Add to cart</button></div></article>`).join(""):`<div class="empty" style="grid-column:1/-1">No products match “${state.q}”. Try a different search or category.</div>`;
}
function totals(){
  const sub=state.cart.reduce((s,i)=>s+PRODUCTS.find(p=>p.id===i.id).p*i.q,0);
  const disc=state.coupon?Math.round(sub*0.10):0;
  const after=sub-disc;
  const ship=after===0||after>=FREE_AT?0:99;
  return{sub,disc,ship,total:after+ship};
}
function updateCount(){$("count").textContent=state.cart.reduce((s,i)=>s+i.q,0)}
function add(id){
  const it=state.cart.find(i=>i.id===id);
  it?it.q++:state.cart.push({id,q:1});
  save();updateCount();toast("Added to cart");
}
function openPanel(html){$("panel").innerHTML=html;$("panel").classList.add("on");$("ov").classList.add("on")}
function closePanel(){$("panel").classList.remove("on");$("ov").classList.remove("on")}

function showCart(){
  const t=totals();
  const lines=state.cart.length?state.cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return`<div class="line"><div class="e">${p.e}</div><div><strong>${p.n}</strong><div class="meta">${rs(p.p)} each</div><div class="qty"><button data-dec="${p.id}" aria-label="Decrease">−</button><span>${i.q}</span><button data-inc="${p.id}" aria-label="Increase">+</button></div></div><div><strong>${rs(p.p*i.q)}</strong></div></div>`}).join(""):`<div class="empty">Your cart is empty. Add a product to get started.</div>`;
  openPanel(`<div class="head"><h2>Your cart</h2><button class="btn" data-close>Close</button></div>
  <div class="body">${lines}</div>
  ${state.cart.length?`<div class="coupon"><input id="cp" placeholder="Coupon code" value="${state.coupon||""}"><button class="btn" id="applyCp">Apply</button></div><div class="msg" id="cpMsg"></div>
  <div class="sum"><div><span>Subtotal</span><span>${rs(t.sub)}</span></div>${t.disc?`<div><span>Discount (10%)</span><span>−${rs(t.disc)}</span></div>`:""}<div><span>Delivery</span><span>${t.ship?rs(t.ship):"Free"}</span></div><div class="tot"><span>Total</span><span>${rs(t.total)}</span></div></div>
  <button class="btn primary" style="margin-top:12px;padding:12px" id="toCheckout">Checkout</button>`:""}`);
}
function showCheckout(){
  if(!state.user){showLogin(true);return}
  const t=totals();
  openPanel(`<div class="head"><h2>Checkout</h2><button class="btn" id="backCart">Back</button></div>
  <div class="body"><div class="f">
  <label>Full name<input id="ck_n" value="${state.user.name}"></label>
  <label>Phone<input id="ck_p" inputmode="tel" maxlength="10" placeholder="10-digit mobile number"></label>
  <label>Address<input id="ck_a" placeholder="House no., street, city"></label>
  <label>PIN code<input id="ck_z" inputmode="numeric" maxlength="6" placeholder="6 digits"></label></div>
  <div class="msg err" id="ckMsg"></div>
  <div class="sum"><div><span>Items</span><span>${state.cart.reduce((s,i)=>s+i.q,0)}</span></div><div class="tot"><span>Pay on delivery</span><span>${rs(t.total)}</span></div></div></div>
  <button class="btn primary" style="padding:12px" id="place">Place order</button>`);
}
function placeOrder(){
  const n=$("ck_n").value.trim(),p=$("ck_p").value.trim(),a=$("ck_a").value.trim(),z=$("ck_z").value.trim();
  const m=$("ckMsg");
  if(n.length<2)return m.textContent="Enter your full name.";
  if(!/^[6-9]\d{9}$/.test(p))return m.textContent="Enter a valid 10-digit mobile number.";
  if(a.length<8)return m.textContent="Enter your full address.";
  if(!/^\d{6}$/.test(z))return m.textContent="Enter a 6-digit PIN code.";
  const t=totals();
  const orders=store.get("dw_orders",[]);
  const id="DW"+Date.now().toString().slice(-7);
  orders.unshift({id,user:state.user.email,date:new Date().toLocaleDateString("en-IN"),total:t.total,items:state.cart.map(i=>({n:PRODUCTS.find(p=>p.id===i.id).n,q:i.q})),status:"Confirmed"});
  store.set("dw_orders",orders);
  state.cart=[];state.coupon=null;save();updateCount();
  openPanel(`<div class="head"><h2>Order placed</h2><button class="btn" data-close>Close</button></div><div class="body"><div class="empty"><div style="font-size:48px">✅</div><p>Thanks, ${n}. Your order <strong>${id}</strong> of ${rs(t.total)} is confirmed. Pay when it arrives.</p></div></div>`);
}
function showLogin(thenCheckout){
  openPanel(`<div class="head"><h2>Sign in</h2><button class="btn" data-close>Close</button></div>
  <div class="body"><p class="meta">New here? Entering your details creates an account on this device.</p><div class="f">
  <label>Name<input id="lg_n" autocomplete="name"></label>
  <label>Email<input id="lg_e" type="email" autocomplete="email"></label>
  <label>Password (min 6 characters)<input id="lg_p" type="password" autocomplete="current-password"></label></div>
  <div class="msg err" id="lgMsg"></div></div>
  <button class="btn primary" style="padding:12px" id="doLogin" data-next="${thenCheckout?1:0}">Continue</button>`);
}
async function sha(s){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function doLogin(next){
  const n=$("lg_n").value.trim(),e=$("lg_e").value.trim().toLowerCase(),p=$("lg_p").value;
  const m=$("lgMsg");
  if(n.length<2)return m.textContent="Enter your name.";
  if(!/^\S+@\S+\.\S+$/.test(e))return m.textContent="Enter a valid email address.";
  if(p.length<6)return m.textContent="Password must be at least 6 characters.";
  let users;try{users=store.get("dw_users",{});}catch(x){users={}}
  const h=await sha(p);
  if(users[e]&&users[e].h!==h)return m.textContent="Wrong password for this email.";
  if(!users[e]){users[e]={n,h};store.set("dw_users",users)}
  state.user={name:users[e].n,email:e};save();renderUser();
  next?showCheckout():(closePanel(),toast("Signed in"));
}
function showAccount(){
  const orders=store.get("dw_orders",[]).filter(o=>o.user===state.user.email);
  openPanel(`<div class="head"><h2>Hi, ${state.user.name}</h2><button class="btn" data-close>Close</button></div>
  <div class="body"><h3 style="margin:6px 0 10px">Your orders</h3>${orders.length?orders.map(o=>`<div class="order"><strong>${o.id}</strong> · ${o.date}<div class="meta">${o.items.map(i=>i.n+" × "+i.q).join(", ")}</div><div>${rs(o.total)} <span class="ok">${o.status}</span></div></div>`).join(""):`<div class="empty">No orders yet. Your orders will appear here.</div>`}</div>
  <button class="btn" id="logout" style="padding:12px">Sign out</button>`);
}
function renderUser(){$("userBtn").textContent=state.user?state.user.name.split(" ")[0]:"Sign in"}

document.addEventListener("click",e=>{
  const t=e.target.closest("button,.overlay");if(!t)return;
  if(t.dataset.add)return add(+t.dataset.add);
  if(t.dataset.c){state.cat=t.dataset.c;renderCats();return renderGrid()}
  if(t.dataset.inc||t.dataset.dec){
    const id=+(t.dataset.inc||t.dataset.dec),it=state.cart.find(i=>i.id===id);
    it.q+=t.dataset.inc?1:-1;
    if(it.q<1)state.cart=state.cart.filter(i=>i.id!==id);
    save();updateCount();return showCart();
  }
  if(t.id==="applyCp"){
    const v=$("cp").value.trim().toUpperCase();
    if(v==="THIRANEX10"){state.coupon=v;showCart();$("cpMsg").textContent="Coupon applied: 10% off.";$("cpMsg").className="msg ok"}
    else{state.coupon=null;showCart();$("cpMsg").textContent="That code isn’t valid. Check it and try again.";$("cpMsg").className="msg err"}
    return;
  }
  if(t.id==="cartBtn")return showCart();
  if(t.id==="userBtn")return state.user?showAccount():showLogin(false);
  if(t.id==="toCheckout")return showCheckout();
  if(t.id==="backCart")return showCart();
  if(t.id==="place")return placeOrder();
  if(t.id==="doLogin")return doLogin(t.dataset.next==="1");
  if(t.id==="logout"){state.user=null;save();renderUser();closePanel();return toast("Signed out")}
  if(t.hasAttribute("data-close")||t.id==="ov")return closePanel();
});
$("q").addEventListener("input",e=>{state.q=e.target.value;renderGrid()});
$("sort").addEventListener("change",e=>{state.sort=e.target.value;renderGrid()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closePanel()});
renderCats();renderGrid();renderUser();updateCount();
