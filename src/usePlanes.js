import { useState, useCallback } from 'react'
import useInterval from "./useInterval";
import {
	calcRotation,
	coordinateChange,
	calcDistance
} from './utils';

const BOUNDS_SIZE = 2;

export default function usePlanes(userLocation, refetchInterval) {
	const [planes, setPlanes] = useState([]);


	const fetchPlanes = useCallback(() => {
		if (!userLocation) return
		const { lat, lng } = userLocation
		const url = `https://opensky-network.org/api/states/all?lamin=${lat - BOUNDS_SIZE}&lomin=${lng - BOUNDS_SIZE}&lamax=${lat + BOUNDS_SIZE}&lomax=${lng + BOUNDS_SIZE}`

		fetch(url).then(res => {
			res.json().then(data => {
				if (data.states) {
					const incomingPlanes = data.states.map(plane => {
						const id = plane[0];
						const lat = plane[6];
						const lng = plane[5];
						const distance = calcDistance(lat, lng, userLocation.lat, userLocation.lng)
						return ({ id, lat, lng, distance, type: "plane", rotation: 0 });
					})
					setPlanes((prev) => {
						const currPlanes = prev
						const newPlanes = incomingPlanes.filter(np => !currPlanes.some(cp => cp.id === np.id))
						const unionPlanes = incomingPlanes
							.filter(np => currPlanes.some(cp => cp.id === np.id))
							.map(p => {
								const { lat, lng } = p;
								const { lat: prevLat, lng: prevLng, rotation: prevRotation } = currPlanes.find(cp => cp.id === p.id);

								const rotation = coordinateChange(lat, lng, prevLat, prevLng) ? calcRotation(lat, lng, prevLat, prevLng) : prevRotation;
								return ({
									...p,
									rotation
								});
							})

						const newState = unionPlanes.length ? [...unionPlanes, ...newPlanes] : [...incomingPlanes];

						console.log(`${unionPlanes.length} updated 🛩  ${newPlanes.length} new 🛩 `);

						return newState.sort((a, b) => {
							return a.distance - b.distance
						});
					});
				}
			})
		})
	}, [userLocation])

	// Fetch planes every 11s due to API throttling
	useInterval(() => {
		if (userLocation) {
			fetchPlanes();
		}
	}, refetchInterval);

	return planes
}