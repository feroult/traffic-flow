const CAR = 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z';
let count = 0;

let infoWindow;

function updateVehicles(events) {
    if (!showVehicles) {
        return;
    }

    const now = new Date();

    for (let i = 0, l = events.length; i < l; i++) {
        const event = events[i];
        if (vehicles.hasOwnProperty(event.vehicleId)) {
            const latLng = new google.maps.LatLng(event.lat, event.lng);
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
                position: new google.maps.LatLng(event.lat, event.lng),
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

    // console.log('clear', count, elements.length, old.length, newElements.length);

    elements = newElements;
}

setInterval(clearOldElements, VEHICLES_FADEOUT_PERIOD);

function toggleVehicles(e) {
    showVehicles = e.checked;
    if (!showVehicles) {
        for (let i = 0, l = elements.length; i < l; i++) {
            elements[i].marker.setMap(null);
        }
        vehicles = {};
        elements = [];
    }

}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// road

function updateRoad(events) {
    if (!events.length) {
        return;
    }
    const event = events[events.length - 1];
    document.getElementById('day-counter').innerHTML = event.count;

    if (currentVehicles === undefined) {
        currentVehicles = event.count;
    } else {
        document.getElementById('current-counter').innerHTML = (event.count - currentVehicles) + '';
    }
}

// stretches

function updateStretches(events) {
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
    // console.log('refreshing stretch:', key);

    if (!stretch) {
        const path = event.path.map(function (latLng) {
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
            polyline.setOptions({strokeWeight: getStrokeWeight(key)});
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
        stretch.polyline.setMap(map);
        stretch.infoWindow.setContent(getInfo(key));
    }

    stretches[key].timeoutId = createStretchTimeout(key);
}

function createStretchTimeout(key) {
    const stretch = stretches[key];
    if (stretch.timeoutId) {
        clearTimeout(stretch.timeoutId);
    }
    return setTimeout(function () {
        stretch.polyline.setMap(null);
    }, 30000);
}

function getInfo(key) {
    const stretch = stretches[key];
    const content = `<div style="padding: 10px; font-size: 24px; text-align: right;">` +
        `<p>Vehicles <strong><span style="font-size: 28px">${stretch.vehiclesCount}</span></strong></p>` +
        `<p>Avg Speed <strong><span style="font-size: 28px">${stretch.avgSpeed.toFixed(2)}</span></strong></p>` +
        `</div>`;
    return content;
}

function getStretchPolylineOptions(key) {
    return {
        strokeColor: getStretchColor(key),
        strokeOpacity: getStrokeOpacity(key),
        strokeWeight: getStrokeWeight(key)
    };
}

function getStretchColor(key, highlight) {
    const stretch = stretches[key];

    const number = stretch.avgSpeed <= 5 ? 0 : stretch.avgSpeed > 100 ? 100 : stretch.avgSpeed;
    return numberToColorHsl(number);
}

function getStrokeOpacity(key) {
    return 1;
}

function getStrokeWeight(key) {
    const stretch = stretches[key];
    return Math.max((stretch.vehiclesCount / 100), 1) * getStrokeWeightByZoom();
}

function getStrokeWeightByZoom() {
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

function hslToRgb(h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

function numberToColorHsl(i) {
    var hue = i * 1.2 / 360;
    var rgb = hslToRgb(hue, 1, .5);
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
}

