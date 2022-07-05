import { useState, useEffect } from "react";
import { nullIslandMarker } from "../App";

export default function useUserLocation() {
	const [userLocation, setUserLocation] = useState(null)

	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				const { latitude, longitude } = position.coords;
				console.log("User position found:", latitude, longitude)
				const location = { lat: latitude, lng: longitude }
				setUserLocation(location);
			}, function (err) {
				const { lat, lng } = nullIslandMarker
				setUserLocation({ lat, lng })
			});
		} else {
			const { lat, lng } = nullIslandMarker
			setUserLocation({ lat, lng })
		}
	}, [])

	return userLocation
}