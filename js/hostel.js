(function hostel() {
  const ROOMS = [
    { id: "BH2-101", block: "Boys Hostel II", type: "4-sharing", status: "Occupied" },
    { id: "BH2-214", block: "Boys Hostel II", type: "3-sharing", status: "Available" },
    { id: "BH1-012", block: "Boys Hostel I", type: "4-sharing", status: "Occupied" },
    { id: "BH3-308", block: "Boys Hostel III", type: "2-sharing", status: "Occupied" },
    { id: "GH-P12", block: "Pink Girls Hostel", type: "3-sharing", status: "Occupied" },
    { id: "GH-D04", block: "Deluxe Girls Hostel", type: "2-sharing", status: "Available" },
  ];
  const KEY = "etc-hostel-tickets";

  const table = document.getElementById("room-table");
  const form = document.getElementById("complaint-form");
  const list = document.getElementById("ticket-list");
  const roomSelect = document.getElementById("room-id");
  const categorySelect = document.getElementById("category");
  const detailInput = document.getElementById("detail");
  const feedback = document.getElementById("form-feedback");

  table.innerHTML = ROOMS.map(
    (r) => `<tr class="border-b border-slate-100">
      <td class="px-4 py-3 font-semibold text-navy">${r.id}</td>
      <td class="px-4 py-3">${r.block}</td>
      <td class="px-4 py-3">${r.type}</td>
      <td class="px-4 py-3"><span class="rounded-full px-2 py-0.5 text-xs ${r.status === "Available" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}">${r.status}</span></td>
    </tr>`
  ).join("");

  roomSelect.insertAdjacentHTML("beforeend", ROOMS.map((r) => `<option value="${r.id}">${r.id} · ${r.block}</option>`).join(""));

  function tickets() {
    try {
      const items = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  function save(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
      return true;
    } catch {
      return false;
    }
  }

  function renderTickets() {
    const items = tickets();
    if (!items.length) {
      list.innerHTML = `<p class="text-sm text-slate-500">No complaints yet. Submit one using the form.</p>`;
      return;
    }
    list.replaceChildren(...items.map((ticket) => {
      const card = document.createElement("article");
      card.className = "rounded-xl border border-slate-200 bg-white p-4";
      const row = document.createElement("div");
      row.className = "flex items-start justify-between gap-3";
      const content = document.createElement("div");
      const title = document.createElement("p");
      title.className = "font-semibold text-navy";
      title.textContent = `${ticket.token} · ${ticket.room}`;
      const description = document.createElement("p");
      description.className = "text-sm text-slate-600";
      description.textContent = `${ticket.category} - ${ticket.detail}`;
      const timestamp = document.createElement("p");
      timestamp.className = "mt-1 text-xs text-slate-400";
      timestamp.textContent = ticket.when;
      const status = document.createElement("span");
      status.className = "rounded-full bg-gold/20 px-2 py-1 text-xs font-semibold text-navy";
      status.textContent = ticket.status;
      content.append(title, description, timestamp);
      row.append(content, status);
      card.append(row);
      return card;
    }));
  }

  detailInput.addEventListener("input", () => {
    detailInput.setCustomValidity(detailInput.value.length > 0 && detailInput.value.trim().length < 12
      ? "Please describe the issue using at least 12 non-space characters."
      : "");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    detailInput.setCustomValidity(detailInput.value.trim().length < 12
      ? "Please describe the issue using at least 12 non-space characters."
      : "");
    if (!form.reportValidity()) return;

    const items = tickets();
    const token = `MT-${Date.now().toString(36).toUpperCase()}`;
    items.unshift({
      token,
      room: roomSelect.value,
      category: categorySelect.value,
      detail: detailInput.value.trim(),
      status: "Open",
      when: new Date().toLocaleString(),
    });
    if (!save(items)) {
      feedback.className = "mt-3 text-sm text-red-700";
      feedback.textContent = "Could not save this ticket in browser storage. Check your browser settings and try again.";
      return;
    }
    form.reset();
    detailInput.setCustomValidity("");
    feedback.className = "mt-3 text-sm text-emerald-700";
    feedback.textContent = `Ticket ${token} submitted and saved in this browser.`;
    renderTickets();
  });

  renderTickets();
})();
