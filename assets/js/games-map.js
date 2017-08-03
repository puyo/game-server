import L from "leaflet"

document.addEventListener("DOMContentLoaded", function(event) { 
  const mapDiv = document.getElementById("games_map");
  if (mapDiv) {
    initMap(mapDiv);
  }
});

function initMap(mapDiv) {
  const map = L.map(mapDiv)
    .setMaxZoom(13)
    .setView([-33.84829,151.1770955], 12);

  L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18,
  }).addTo(map);

  const markers = L.featureGroup()
    .addTo(map);

  fetch("/api/games")
    .then(json => json.json())
    .then(response => {
      response.data.forEach(game => {
        L.marker(game.coordinates)
          .addTo(markers)
          .bindPopup(game.name);
      });
      map.fitBounds(markers.getBounds());
    })
}
