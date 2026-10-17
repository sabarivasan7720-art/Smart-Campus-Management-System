(async function cafe() {
  const res = await fetch("data/cafe-menu.json");
  const menu = await res.json();
  const KEY = "etc-cafe-cart";
  const menuEl = document.getElementById("menu");
  const cartEl = document.getElementById("cart");
  const totalEl = document.getElementById("total");
  const place = document.getElementById("place-order");
  const ticket = document.getElementById("ticket");

  function cart() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  }
  function setCart(c) {
    localStorage.setItem(KEY, JSON.stringify(c));
  }

  const itemsById = {};
  menu.categories.forEach((cat) => {
    cat.items.forEach((it) => {
      itemsById[it.id] = it;
    });
  });

  menuEl.innerHTML = menu.categories
    .map(
      (cat) => `<section>
        <h3 class="mb-3 font-bold text-navy">${cat.name}</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          ${cat.items
            .map(
              (it) => `<article class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <p class="font-semibold text-navy">${it.name}</p>
                  <p class="text-sm text-slate-500">₹${it.price} ${it.veg ? "· Veg" : "· Non-veg"}</p>
                </div>
                <button data-add="${it.id}" class="rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-gold">Add</button>
              </article>`
            )
            .join("")}
        </div>
      </section>`
    )
    .join("");

  function renderCart() {
    const c = cart();
    const ids = Object.keys(c).filter((id) => c[id] > 0);
    if (!ids.length) {
      cartEl.innerHTML = `<p class="text-sm text-slate-500">Cart is empty.</p>`;
      totalEl.textContent = "₹0";
      return;
    }
    let total = 0;
    cartEl.innerHTML = ids
      .map((id) => {
        const it = itemsById[id];
        const qty = c[id];
        const line = it.price * qty;
        total += line;
        return `<div class="flex items-center justify-between gap-2 py-2 border-b border-slate-100">
          <span>${it.name} × ${qty}</span>
          <span class="flex items-center gap-2">
            <span>₹${line}</span>
            <button data-sub="${id}" class="text-xs text-slate-500 hover:text-navy">−</button>
          </span>
        </div>`;
      })
      .join("");
    totalEl.textContent = `₹${total}`;
  }

  menuEl.addEventListener("click", (e) => {
    const id = e.target.closest("[data-add]")?.dataset.add;
    if (!id) return;
    const c = cart();
    c[id] = (c[id] || 0) + 1;
    setCart(c);
    renderCart();
  });
  cartEl.addEventListener("click", (e) => {
    const id = e.target.closest("[data-sub]")?.dataset.sub;
    if (!id) return;
    const c = cart();
    c[id] = Math.max(0, (c[id] || 0) - 1);
    setCart(c);
    renderCart();
  });

  place.addEventListener("click", () => {
    const c = cart();
    const has = Object.values(c).some((n) => n > 0);
    if (!has) {
      ticket.textContent = "Add items before placing a token order.";
      ticket.classList.remove("hidden");
      return;
    }
    const n = `FC-${Math.floor(100 + Math.random() * 900)}`;
    ticket.innerHTML = `<strong>Token ${n}</strong> — show this at Fusion Café. Demo only; no payment charged.`;
    ticket.classList.remove("hidden");
    setCart({});
    renderCart();
  });

  document.getElementById("hours").textContent = menu.hours;
  renderCart();
})();
