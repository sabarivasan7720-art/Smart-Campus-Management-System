const CampusMap = (() => {
  let map;
  let data;
  let markers = {};
  let routeLayer;
  let youAreHere;
  let originId;
  let filterId = "all";
  let selectedId = null;
  const listeners = { navigate: [] };

  const CAT_COLOR = {
    departments: "#1b6b73",
    hostels: "#c45c4a",
    amenities: "#C9A227",
    administrative: "#0B1F4B",
  };

  function xy(coords) {
    return L.latLng(coords[1], coords[0]);
  }

  function pinIcon(loc, state) {
    const color = CAT_COLOR[loc.category] || "#0B1F4B";
    const pulse = state === "active" ? "campus-pin-pulse" : "";
    const dim = state === "dim" ? "opacity:0.28;filter:grayscale(.4)" : "";
    const ring = state === "origin" ? "box-shadow:0 0 0 4px #fff,0 0 0 7px #C9A227;" : "";
    return L.divIcon({
      className: "",
      iconSize: [34, 42],
      iconAnchor: [17, 40],
      popupAnchor: [0, -36],
      html: `<div class="${pulse}" style="${dim}${ring}width:34px;height:42px;display:flex;flex-direction:column;align-items:center">
        <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(11,31,75,.35)">
          <span style="transform:rotate(45deg);color:#fff;font:700 11px/1 'Plus Jakarta Sans',sans-serif">${loc.number}</span>
        </div>
      </div>`,
    });
  }

  function init(elementId, campus, options = {}) {
    data = campus;
    originId = options.originId || campus.map.defaultOrigin;
    const w = campus.map.width;
    const h = campus.map.height;
    const bounds = [
      [0, 0],
      [h, w],
    ];

    map = L.map(elementId, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 1.6,
      zoomSnap: 0.25,
      attributionControl: false,
    });

    L.imageOverlay(campus.map.image, bounds).addTo(map);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds, { padding: [16, 16] });

    routeLayer = L.layerGroup().addTo(map);

    campus.locations.forEach((loc) => {
      const m = L.marker(xy(loc.coords), { icon: pinIcon(loc, "idle"), title: loc.name });
      m.bindPopup(`<strong>${loc.number}. ${loc.name}</strong><br><span style="color:#5b657a">${CampusData.categoryLabel(loc.category)}</span>`);
      m.on("click", () => navigateTo(loc.id));
      m.addTo(map);
      markers[loc.id] = m;
    });

    refreshPins();
    placeYouAreHere();
    return api;
  }

  function placeYouAreHere() {
    const origin = CampusData.byId(originId);
    if (!origin) return;
    if (youAreHere) map.removeLayer(youAreHere);
    youAreHere = L.circleMarker(xy(origin.coords), {
      radius: 10,
      color: "#C9A227",
      weight: 3,
      fillColor: "#0B1F4B",
      fillOpacity: 1,
    }).addTo(map);
    youAreHere.bindTooltip("You are here", { permanent: false, direction: "right" });
  }

  function pinState(loc) {
    if (loc.id === originId) return "origin";
    if (loc.id === selectedId) return "active";
    if (filterId !== "all" && loc.category !== filterId) return "dim";
    return "idle";
  }

  function refreshPins() {
    data.locations.forEach((loc) => {
      const m = markers[loc.id];
      if (m) m.setIcon(pinIcon(loc, pinState(loc)));
    });
  }

  function setFilter(id) {
    filterId = id;
    refreshPins();
  }

  function setOrigin(id) {
    if (!CampusData.byId(id)) return;
    originId = id;
    placeYouAreHere();
    refreshPins();
    if (selectedId) {
      const route = drawRoute(selectedId);
      notifyNavigate(selectedId, route);
    }
  }

  function drawRoute(destId) {
    const r = CampusData.route(originId, destId);
    routeLayer.clearLayers();
    if (!r) return r;
    const latlngs = r.path.map(xy);
    if (latlngs.length > 1) {
      L.polyline(latlngs, {
        color: "#0B1F4B",
        weight: 10,
        opacity: 0.18,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(routeLayer);
      L.polyline(latlngs, {
        color: "#C9A227",
        weight: 5,
        opacity: 1,
        lineJoin: "round",
        dashArray: "12 10",
      }).addTo(routeLayer);
    }
    return r;
  }

  function navigateTo(destId) {
    const loc = CampusData.byId(destId);
    if (!loc) return;
    selectedId = destId;
    const r = drawRoute(destId);
    refreshPins();
    markers[destId]?.openPopup();
    map.panTo(xy(loc.coords), { animate: true });
    notifyNavigate(destId, r);
  }

  function notifyNavigate(destId, route) {
    const loc = CampusData.byId(destId);
    if (!loc || !route) return;
    listeners.navigate.forEach((fn) => fn(route, loc));
  }

  function invalidateSize() {
    map?.invalidateSize({ pan: false });
  }

  function onNavigate(fn) {
    listeners.navigate.push(fn);
  }

  function getOriginId() {
    return originId;
  }

  const api = {
    init,
    setFilter,
    setOrigin,
    navigateTo,
    onNavigate,
    getOriginId,
    invalidateSize,
    refreshPins,
  };
  return api;
})();
