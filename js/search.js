const CampusSearch = (() => {
  function bind({ input, list, onSelect }) {
    let active = -1;
    let results = [];

    function render(q) {
      results = CampusData.search(q).slice(0, 8);
      active = -1;
      if (!q.trim()) {
        list.classList.add("hidden");
        list.innerHTML = "";
        return;
      }
      if (!results.length) {
        list.classList.remove("hidden");
        list.innerHTML = `<li class="px-4 py-3 text-sm text-slate-500">No matching campus spot</li>`;
        return;
      }
      list.classList.remove("hidden");
      list.innerHTML = results
        .map(
          (loc, i) => `<li>
            <button type="button" data-i="${i}" class="w-full text-left px-4 py-3 hover:bg-gold/15 flex items-start gap-3">
              <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">${loc.number}</span>
              <span>
                <span class="block font-semibold text-navy">${loc.name}</span>
                <span class="block text-xs text-slate-500">${CampusData.categoryLabel(loc.category)}</span>
              </span>
            </button>
          </li>`
        )
        .join("");
    }

    function choose(i) {
      const loc = results[i];
      if (!loc) return;
      input.value = loc.name;
      list.classList.add("hidden");
      onSelect(loc);
    }

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("focus", () => {
      if (input.value.trim()) render(input.value);
    });
    input.addEventListener("keydown", (e) => {
      if (list.classList.contains("hidden")) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = Math.min(active + 1, results.length - 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = Math.max(active - 1, 0);
      } else if (e.key === "Enter") {
        e.preventDefault();
        choose(active >= 0 ? active : 0);
        return;
      } else if (e.key === "Escape") {
        list.classList.add("hidden");
        return;
      }
      [...list.querySelectorAll("button")].forEach((b, i) => {
        b.classList.toggle("bg-gold/20", i === active);
      });
    });
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-i]");
      if (btn) choose(Number(btn.dataset.i));
    });
    document.addEventListener("click", (e) => {
      if (!input.contains(e.target) && !list.contains(e.target)) list.classList.add("hidden");
    });
  }

  return { bind };
})();
