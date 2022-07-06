import { useEffect } from 'react'
import { useState, useCallback } from 'react'
import { calcDistance, calcRotation } from '../utils'

import useInterval from './useInterval'

const BASE_URL = 'https://opensky-network.org/api/states/all'
const BOUNDS_SIZE = 2

function usePlanes(location) {
	const [planes, setPlanes] = useState([])

	const fetchPlanes = useCallback(() => {
		const { lat, lng } = location
		const url = `${BASE_URL}?lamin=${lat - BOUNDS_SIZE}&lomin${lng - BOUNDS_SIZE}&lamax=${lat + BOUNDS_SIZE}&lomax=${lng + BOUNDS_SIZE}`
		fetch(url).then(res => {
			if (res.status === 429) {
				alert('OpenSky rate limit reached')
			}
			res.json().then((data => {
				console.log(JSON.stringify(data.states))
				const fetchedPlanes = data.states.map(plane => {
					const [id, , origin, , , lng, lat] = plane
					const distance = calcDistance(location.lat, location.lng, lat, lng)
					return ({
						id,
						origin,
						lat,
						lng,
						distance,
						type: "plane",
						rotation: 0,
					})
				})

				setPlanes((prev) => {
					const currPlanes = prev
					const newPlanes = fetchedPlanes.filter(fp => {
						return !currPlanes.some(cp => cp.id === fp.id)
					})
					const unionPlanes = fetchedPlanes
						.filter(fp => currPlanes.some(cp => cp.id === fp.id))
						.map(p => {
							const { lat, lng } = p
							const { lat: prevLat, lng: prevLng, rotation: prevRotation } = currPlanes.find(cp => cp.id === p.id)
							const rotation = lat !== prevLat || lng !== prevLng ? calcRotation(lat, lng, prevLat, prevLng) : prevRotation
							return ({
								...p,
								rotation
							})
						})
					const newState = [...unionPlanes, ...newPlanes];
					console.log(`${unionPlanes.length} updated. ${newPlanes.length} new planes`)
					return newState.sort((a, b) => {
						return a.distance - b.distance
					})
				})
			}))
		})
	}, [location])

	useEffect(() => {
		if (location) {
			fetchPlanes()
		}
	}, [location, fetchPlanes])

	useInterval(() => {
		if (location) {
			fetchPlanes()
		}
	}, 10000)

	return planes
}
export default usePlanes