(async function home() {
  const campus = await CampusData.load();
  const params = new URLSearchParams(location.search);
  const originId = CampusData.byId(params.get("from"))?.id || campus.map.defaultOrigin;

  const originChip = document.getElementById("origin-chip");
  const destTitle = document.getElementById("dest-title");
  const destMeta = document.getElementById("dest-meta");
  const destDesc = document.getElementById("dest-desc");
  const stepsEl = document.getElementById("steps");
  const emptyHint = document.getElementById("empty-hint");

  function setOriginLabel() {
    const o = CampusData.byId(CampusMap.getOriginId());
    originChip.textContent = `From: ${o.name}`;
  }

  CampusMap.init("map", campus, { originId });
  setOriginLabel();

  CampusMap.onNavigate((route, loc) => {
    emptyHint.classList.add("hidden");
    destTitle.textContent = loc.name;
    destMeta.textContent = `${CampusData.categoryLabel(loc.category)} · ~${route.minutes} min walk`;
    destDesc.textContent = loc.description;
    stepsEl.innerHTML = route.steps
      .map(
        (s, i) => `<li class="flex gap-3">
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">${i + 1}</span>
          <span class="text-slate-700">${s}</span>
        </li>`
      )
      .join("");
  });

  CampusSearch.bind({
    input: document.getElementById("search"),
    list: document.getElementById("search-list"),
    onSelect: (loc) => CampusMap.navigateTo(loc.id),
  });

  document.getElementById("filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    document.querySelectorAll("[data-filter]").forEach((b) => {
      b.classList.remove("bg-navy", "text-gold");
      b.classList.add("bg-white", "text-navy");
    });
    btn.classList.remove("bg-white", "text-navy");
    btn.classList.add("bg-navy", "text-gold");
    CampusMap.setFilter(btn.dataset.filter);
  });

  document.getElementById("reset-route").addEventListener("click", () => {
    location.href = "index.html";
  });
})();
