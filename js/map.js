const CAR = 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z';
let count = 0;

let infoWindow;

function addVehicleMarkers(events) {

    const now = new Date();

    for (let i = 0, l = events.length; i < l; i++) {
        const event = events[i];
        if (vehicles.hasOwnProperty(event.vehicleId)) {
            const latLng = new google.maps.LatLng(event.location.lat, event.location.lng);
            var marker = vehicles[event.vehicleId];

            if (!marker.getMap()) {
                marker.setMap(map);
                elements.push({
                    marker: marker,
                    timestamp: now
                });
            }
            marker.setPosition(latLng);

        } else {
            const color = getRandomColor();

            const icon = {
                path: CAR,
                strokeColor: color,
                fillColor: color,
                fillOpacity: 0.7,
                strokeOpacity: 1
            };

            const marker = new google.maps.Marker({
                position: event.location,
                icon: icon,
                map: map
            });

            vehicles[event.vehicleId] = marker;
            elements.push({
                marker: marker,
                timestamp: now
            });
            count++;
        }
    }
}

function clearOldElements() {
    const now = new Date();
    const old = elements.filter(function (el) {
        return now - el.timestamp > VEHICLES_FADEOUT_PERIOD
    });

    if (old.length === 0) {
        return;
    }

    for (let i = 0, l = old.length; i < l; i++) {
        old[i].marker.setMap(null);
    }

    const newElements = elements.filter(function (el) {
        return now - el.timestamp <= VEHICLES_FADEOUT_PERIOD
    });

    console.log('clear', count, elements.length, old.length, newElements.length);

    elements = newElements;
}

setInterval(clearOldElements, 15000);

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// stretches


function addStretches(events) {
    for (let i = 0, l = events.length; i < l; i++) {
        addStretch(events[i]);
    }
}

function addStretch(event) {
    // let infoWindow;
    if (!infoWindow) {
        infoWindow = new google.maps.InfoWindow();
    }

    const key = event.index + '';

    const stretch = stretches[key];
    console.log('refreshing', key);

    if (!stretch) {
        const path = JSON.parse(event.path).map(function (latLng) {
            return new google.maps.LatLng(latLng.lat, latLng.lng);
        });

        stretches[key] = {
            avgSpeed: event.avgSpeed,
            vehiclesCount: event.vehiclesCount
        };

        const options = getStretchPolylineOptions(key);
        options.path = path;

        const polyline = new google.maps.Polyline(options);
        stretches[key].polyline = polyline;

        polyline.setMap(map);


        google.maps.event.addListener(map, 'zoom_changed', function () {
            console.log('zoom', map.getZoom());
            polyline.setOptions({strokeWeight: getStrokeWeight()});
        });


        stretches[key].infoWindow = new google.maps.InfoWindow({
            position: path[0],
            content: getInfo(key)
        });

        polyline.addListener('click', function () {
            stretches[key].infoWindow.open(map, polyline);
        });

        polyline.addListener('mouseover', function () {
            polyline.setOptions({strokeColor: getStretchColor(key, true)});
        });

        polyline.addListener('mouseout', function () {
            polyline.setOptions({strokeColor: getStretchColor(key, false)});
        });

    } else {
        stretch.avgSpeed = event.avgSpeed;
        stretch.vehiclesCount = event.vehiclesCount;
        stretch.polyline.setOptions(getStretchPolylineOptions(key));
        stretch.infoWindow.setContent(getInfo(key));
    }
}


function getInfo(key) {
    const stretch = stretches[key];
    const content = `<div style="padding: 10px; font-size: 24px; text-align: right;">` +
        `<p>Avg Speed: <strong><span style="font-size: 28px">${stretch.avgSpeed.toFixed(2)}</span></strong></p>` +
        `<p>Vehicles: <strong><span style="font-size: 28px">${stretch.vehiclesCount}</span></strong></p>` +
        `</div>`;
    console.log('x', content);
    return content;
}

function getStretchPolylineOptions(key) {
    return {
        strokeColor: getStretchColor(key),
        strokeOpacity: getStrokeOpacity(key),
        strokeWeight: getStrokeWeight()
    };
}

function getStretchColor(key, highlight) {
    const stretch = stretches[key];

    if (stretch.avgSpeed < 50) {
        return highlight ? "#FF0000" : "#AA0000";
    } else {
        return highlight ? "#AAAAAA" : "#666666";
    }
}

function getStrokeOpacity(key) {
    const stretch = stretches[key];

    if (stretch.avgSpeed < 50) {
        return 1;
    } else {
        return 1;
    }
}

function getStrokeWeight() {
    const zoom = map.getZoom();
    if (zoom < 11) {
        return 2;
    }
    if (zoom === 11) {
        return 3;
    }
    if (zoom > 11 && zoom <= 13) {
        return 5;
    }
    if (zoom > 13 && zoom < 17) {
        return 6;
    }
    if (zoom === 17) {
        return 11;
    }
    return 14;
}
