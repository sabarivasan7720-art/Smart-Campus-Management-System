const CampusData = (() => {
  const CATEGORY_LABELS = {
    departments: "Departments",
    hostels: "Hostels",
    amenities: "Amenities & Food",
    administrative: "Administrative",
  };

  let campus = null;

  async function load() {
    const res = await fetch("data/campus.json");
    if (!res.ok) throw new Error("Could not load campus data");
    campus = await res.json();
    return campus;
  }

  function get() {
    if (!campus) throw new Error("Campus data not loaded");
    return campus;
  }

  function locations() {
    return get().locations;
  }

  function byId(id) {
    return locations().find((l) => l.id === id) || null;
  }

  function categoryLabel(id) {
    return CATEGORY_LABELS[id] || id;
  }

  function search(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return locations();
    return locations()
      .map((loc) => {
        const hay = [loc.name, loc.number.toString(), ...(loc.aliases || [])]
          .join(" ")
          .toLowerCase();
        let score = 0;
        if (hay.includes(q)) score += 2;
        if (loc.name.toLowerCase().startsWith(q)) score += 3;
        if (loc.aliases?.some((a) => a.toLowerCase() === q)) score += 5;
        if (String(loc.number) === q) score += 5;
        return { loc, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.loc);
  }

  function dist(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.hypot(dx, dy);
  }

  function pathLength(path) {
    let n = 0;
    for (let i = 1; i < path.length; i += 1) n += dist(path[i - 1], path[i]);
    return n;
  }

  function walkMinutes(path) {
    const ppm = get().map.pixelsPerMinute || 85;
    return Math.max(1, Math.round(pathLength(path) / ppm));
  }

  function shortestGraphPath(fromSnap, toSnap) {
    const graph = get().walkGraph;
    if (fromSnap === toSnap) return [fromSnap];
    const adj = {};
    Object.keys(graph.nodes).forEach((k) => {
      adj[k] = [];
    });
    graph.edges.forEach(([a, b]) => {
      adj[a].push(b);
      adj[b].push(a);
    });
    const q = [fromSnap];
    const prev = { [fromSnap]: null };
    while (q.length) {
      const n = q.shift();
      if (n === toSnap) break;
      for (const nxt of adj[n] || []) {
        if (prev[nxt] === undefined) {
          prev[nxt] = n;
          q.push(nxt);
        }
      }
    }
    if (prev[toSnap] === undefined) return [fromSnap, toSnap];
    const chain = [];
    let cur = toSnap;
    while (cur) {
      chain.push(cur);
      cur = prev[cur];
    }
    return chain.reverse();
  }

  function graphPathCoords(fromLoc, toLoc) {
    const graph = get().walkGraph;
    const nodes = shortestGraphPath(fromLoc.snap, toLoc.snap);
    const pts = [fromLoc.coords];
    nodes.forEach((id) => {
      const c = graph.nodes[id];
      if (c) pts.push(c);
    });
    pts.push(toLoc.coords);
    return simplifyColinear(pts);
  }

  function simplifyColinear(pts) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i += 1) {
      const a = out[out.length - 1];
      const b = pts[i];
      const c = pts[i + 1];
      const same = a[0] === b[0] && a[1] === b[1];
      if (same) continue;
      out.push(b);
      void c;
    }
    const last = pts[pts.length - 1];
    const prev = out[out.length - 1];
    if (prev[0] !== last[0] || prev[1] !== last[1]) out.push(last);
    return out;
  }

  function route(originId, destId) {
    const origin = byId(originId);
    const dest = byId(destId);
    if (!origin || !dest) return null;
    if (origin.id === dest.id) {
      return {
        path: [dest.coords],
        steps: [`You are already at ${dest.name}.`],
        minutes: 0,
        origin,
        dest,
      };
    }
    const curated = dest.routesFrom?.[originId];
    if (curated?.path?.length) {
      return {
        path: curated.path,
        steps: curated.steps,
        minutes: walkMinutes(curated.path),
        origin,
        dest,
      };
    }
    const path = graphPathCoords(origin, dest);
    return {
      path,
      steps: [
        `Start at ${origin.name}.`,
        `Follow the campus roads toward ${dest.landmark || dest.name}.`,
        `Arrive at ${dest.name}.`,
      ],
      minutes: walkMinutes(path),
      origin,
      dest,
    };
  }

  return { load, get, locations, byId, search, categoryLabel, route, walkMinutes };
})();
