(async function placement() {
  const res = await fetch("data/placements.json");
  const data = await res.json();
  document.getElementById("stat-companies").textContent = data.stats.companies;
  document.getElementById("stat-offers").textContent = data.stats.offers;
  document.getElementById("stat-high").textContent = data.stats.highestCtc;
  document.getElementById("stat-avg").textContent = data.stats.averageCtc;

  document.getElementById("drives").innerHTML = data.drives
    .map(
      (d) => `<article class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-gold">${d.type}</p>
        <h3 class="mt-1 text-lg font-bold text-navy">${d.company}</h3>
        <p class="text-sm text-slate-600">${d.role}</p>
        <p class="mt-3 text-sm"><span class="font-semibold">Date:</span> ${d.date}</p>
        <p class="text-sm"><span class="font-semibold">Eligibility:</span> ${d.eligibility}</p>
        <p class="mt-3 inline-block rounded-full bg-navy px-3 py-1 text-xs font-semibold text-gold">${d.status}</p>
      </article>`
    )
    .join("");

  document.getElementById("news").innerHTML = data.news
    .map(
      (n) => `<article class="border-b border-slate-100 py-4 last:border-0">
        <p class="text-xs text-slate-400">${n.date}</p>
        <h3 class="font-bold text-navy">${n.title}</h3>
        <p class="mt-1 text-sm text-slate-600">${n.body}</p>
      </article>`
    )
    .join("");
})();
