import { useCallback } from 'react'
import { useState } from 'react'
import { calcRotation, calcDistance } from '../utils'

import samplePlanes from '../samplePlanes'
import { useEffect } from 'react'
import useInterval from './useInterval'

const BASE_URL = 'https://opensky-network.org/api/states/all'
const BOUNDS_SIZE = 2

function usePlanes(location) {
	const [planes, setPlanes] = useState([])

	const fetchPlanes = useCallback(() => {
		const { lat, lon } = location
		fetch(`${BASE_URL}?lamin=${lat - BOUNDS_SIZE}&lomin=${lon - BOUNDS_SIZE}&lamax=${lat + BOUNDS_SIZE}&lomax=${lon + BOUNDS_SIZE}`).then((res) => {
			res.json().then(data => {

				const fetchedPlanes = data.states.map(plane => {
					const [id, , origin, , , lon, lat] = plane
					const distance = calcDistance(lat, lon, location.lat, location.lon)
					return ({
						id,
						origin,
						lon,
						lat,
						type: 'plane',
						rotation: 0,
						distance
					})
				})
				setPlanes(currPlanes => {
					const newPlanes = fetchedPlanes.filter(fp => !currPlanes.some(cp => cp.id === fp.id))

					// Check for existing planes in state and calc rotation
					const existingPlanes = fetchedPlanes
						.filter(fp => currPlanes.some(cp => cp.id === fp.id))
						.map(plane => {
							const { lat, lon } = plane;
							const currPlane = currPlanes.find(cp => cp.id === plane.id)
							const { lat: prevLat, lon: prevLon, rotation: prevRotation } = currPlane
							const rotation = lat !== prevLat || lon !== prevLon ? calcRotation(lat, lon, prevLat, prevLon) : prevRotation
							return ({
								...plane,
								rotation,
							})
						})
					const newState = [...newPlanes, ...existingPlanes]
					console.log(`${existingPlanes.length} updated. ${newPlanes.length} added.`)
					return newState.sort((a, b) => {
						return a.distance - b.distance
					})
				})
			})
		})

	}, [setPlanes, location])

	useEffect(() => {
		fetchPlanes()
	}, [location, fetchPlanes])

	useInterval(() => {
		fetchPlanes()
	}, 10000)

	return planes
}
export default usePlanes