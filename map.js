const defaultCoords = [25.2854, 51.5310]; // الدوحة، قطر
const map = L.map('radarMap').setView(defaultCoords, 3);

L.tileLayer('https://{s}://{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 18
}).addTo(map);

let currentMarker = L.marker(defaultCoords).addTo(map)
    .bindPopup('<b>DOHA BASE</b><br>قاعدة الرصد الرئيسية').openPopup();

function moveMapTo(lat, lon, label, zoomLevel = 10) {
    if (lat !== null && lon !== null) {
        map.removeLayer(currentMarker);
        map.flyTo([lat, lon], zoomLevel, { duration: 1.4 });
        currentMarker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${label}</b><br>[${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}]`).openPopup();
    }
}
