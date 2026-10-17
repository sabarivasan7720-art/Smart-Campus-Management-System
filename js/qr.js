(async function qrPage() {
  const campus = await CampusData.load();
  const params = new URLSearchParams(location.search);
  const locParam = params.get("loc") || params.get("from") || campus.map.defaultOrigin;
  let originId = CampusData.byId(locParam)?.id || campus.map.defaultOrigin;

  const banner = document.getElementById("qr-banner");
  const originSelect = document.getElementById("origin-select");
  const destSelect = document.getElementById("dest-select");
  const posterGrid = document.getElementById("poster-grid");
  const stepsEl = document.getElementById("steps");
  const destTitle = document.getElementById("dest-title");
  const destMeta = document.getElementById("dest-meta");

  function fillSelect(el, selected) {
    el.innerHTML = campus.locations
      .map((l) => `<option value="${l.id}" ${l.id === selected ? "selected" : ""}>${l.number}. ${l.name}</option>`)
      .join("");
  }

  function updateBanner() {
    const o = CampusData.byId(originId);
    banner.textContent = `You are at ${o.name}`;
    banner.classList.remove("hidden");
  }

  function renderPosters() {
    posterGrid.innerHTML = campus.locations
      .map((l) => {
        const href = `qr.html?loc=${encodeURIComponent(l.id)}`;
        const on = l.id === originId;
        return `<button type="button" data-id="${l.id}" class="rounded-xl border px-3 py-2 text-left text-sm ${on ? "border-gold bg-gold/15 text-navy font-semibold" : "border-slate-200 bg-white hover:border-navy/30"}">
          <span class="font-bold text-gold">${l.number}</span> ${l.name}
          <span class="mt-1 block text-[11px] text-slate-400">${href}</span>
        </button>`;
      })
      .join("");
  }

  function showRoute(destId) {
    CampusMap.setOrigin(originId);
    CampusMap.navigateTo(destId);
  }

  CampusMap.init("map", campus, { originId });
  CampusMap.onNavigate((route, loc) => {
    destTitle.textContent = loc.name;
    destMeta.textContent = `${CampusData.categoryLabel(loc.category)} · about ${route.minutes} min walk`;
    stepsEl.innerHTML = route.steps
      .map(
        (s, i) => `<li class="flex gap-3">
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">${i + 1}</span>
          <span>${s}</span>
        </li>`
      )
      .join("");
  });

  fillSelect(originSelect, originId);
  fillSelect(destSelect, "central-library");
  updateBanner();
  renderPosters();
  showRoute(destSelect.value);

  originSelect.addEventListener("change", () => {
    originId = originSelect.value;
    history.replaceState(null, "", `qr.html?loc=${encodeURIComponent(originId)}`);
    updateBanner();
    renderPosters();
    showRoute(destSelect.value);
  });
  destSelect.addEventListener("change", () => showRoute(destSelect.value));
  posterGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    originSelect.value = btn.dataset.id;
    originSelect.dispatchEvent(new Event("change"));
  });
})();
