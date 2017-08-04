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
    .then(body => body.json())
    .then(response => {
      response.data.forEach(game => {
        L.marker(game.coordinates)
          .addTo(markers)
          .bindPopup(game.name);
      });
      map.fitBounds(markers.getBounds(), {padding: [10, 10]});
    });

  const searchMarker = L.circle()
    .setRadius(10000); // metres

  const form = document.querySelector('.games-form');

  const searchRadiusMetres = () => {
    const value = parseInt(form.querySelector('.distance-value').value);
    const unit = form.querySelector('.distance-unit').value;
    console.log(value, unit);
    if (unit === "km") {
      return value * 1000;
    } else if (unit === "mi") {
      return value * 1609;
    } else {
      return 10000; // default = 10 km
    }
  }

  const onClick = (e) => {
    L.DomEvent.stopPropagation(e);

    // update search marker
    const searchRadius = searchRadiusMetres();
    searchMarker
      .setLatLng(e.latlng)
      .setRadius(searchRadius)
      .addTo(map);

    // update place input
    const locationInput = form.querySelector('.location-input');
    locationInput.value = e.latlng.lat + ',' + e.latlng.lng;

    // request games nearby
    const searchParams = new URLSearchParams();
    searchParams.append("lat", e.latlng.lat);
    searchParams.append("lng", e.latlng.lng);
    searchParams.append("m", searchRadius);
    const url = "/api/games?" + searchParams.toString();
    fetch(url)
      .then(body => body.json())
      .then(response => {
        response.data.forEach(game => {
          L.marker(game.coordinates)
            .addTo(markers)
            .bindPopup(game.name);
        });
        map.fitBounds(markers.getBounds(), {padding: [10, 10]});
      });
  }

  map.on('click', onClick);
}
