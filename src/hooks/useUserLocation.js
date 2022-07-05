import { useState, useEffect } from "react";

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
				alert(`There was an error getting your location, this site need you location in order to show surrounding planes`)
			});
		} else {
			alert(`Your browser does not support geolocation, this site need you location in order to show surrounding planes`)
		}
	}, [])

	return userLocation
}