import { useState, useCallback, useEffect } from 'react'
import samplePlanes from '../samplePlanes';
import useInterval from "./useInterval";
import {
	calcRotation,
	coordinateChange,
	calcDistance
} from '../utils';

const BOUNDS_SIZE = 2;
const MAX_FETCH_COUNT = 2;

export default function usePlanes(userLocation, refetchInterval) {
	const [planes, setPlanes] = useState([]);
	const [fetchCount, setFetchCount] = useState(0);

	const fetchPlanes = useCallback(() => {
		if (!userLocation) return
		if (fetchCount >= MAX_FETCH_COUNT) return
		const { lat, lng } = userLocation
		// const url = `https://opensky-network.org/api/states/all?lamin=${lat - BOUNDS_SIZE}&lomin=${lng - BOUNDS_SIZE}&lamax=${lat + BOUNDS_SIZE}&lomax=${lng + BOUNDS_SIZE}`

		// fetch(url).then(res => {
		// 	if (res.status === 429) {
		// 		// Block more fetches
		// 		setFetchCount(MAX_FETCH_COUNT)
		// 		alert('Opensky API Rate limit reached')
		// 		return
		// 	}
		// 	res.json().then(data => {
		const data = { states: samplePlanes[fetchCount] }
		if (data.states) {
			console.log(JSON.stringify(data.states))
			setFetchCount(prev => prev + 1)
			const incomingPlanes = data.states.map(plane => {
				const id = plane[0];
				const origin = plane[2]
				const lat = plane[6];
				const lng = plane[5];
				const distance = calcDistance(lat, lng, userLocation.lat, userLocation.lng)
				return ({ id, lat, lng, origin, distance, type: "plane", rotation: 0 });
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
		// 	})
		// })
	}, [userLocation, fetchCount])

	useEffect(() => {
		if (userLocation) {
			fetchPlanes();
		}
	}, [userLocation, fetchPlanes])

	// Fetch planes every 11s due to API throttling
	useInterval(() => {
		if (userLocation) {
			fetchPlanes();
		}
	}, refetchInterval);

	return planes
}