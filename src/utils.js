export function markerInfo(marker) {
    return `lat: ${marker.lat.toFixed(2)} | long: ${marker.lng.toFixed(2)}`;
}

export function userPositionFound(markers) {
    return markers.some(m => m.id === "me");
}

export function isPlane(marker) {
    return marker.type === "plane"
}

export function markerTypeToEmoji(type) {
    if (type === "me") return "🧍🏻"
    if (type === "plane") return "🛩"
    return "🤔"
}

export function getUserMarker(markers) {
    return markers.find(m => m.id === "me")
}

export function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c) / 1000; // in km
}

export function calcRotation(lat1, lng1, lat2, lng2) {
    const φ1 = lat1 * (Math.PI / 180);
    const φ2 = lat2 * (Math.PI / 180);
    const λ1 = lng1 * (Math.PI / 180);
    const λ2 = lng2 * (Math.PI / 180);

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    return (θ + 2 * Math.PI) % (2 * Math.PI);
}

export function coordinateChange(lat1, lng1, lat2, lng2) {
    return lat1 !== lat2 || lng1 !== lng2;
}