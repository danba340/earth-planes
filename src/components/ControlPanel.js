import { markerTypeToEmoji } from "../utils"

function ControlPanel({ markers, activeMarkerId, setActiveMarkerId }) {

	const activeMarkerIndex = markers.findIndex(m => m.id === activeMarkerId);
	const activeMarker = markers[activeMarkerIndex]

	if (!activeMarker) return null
	return (
		<>
			<div>
				<span>{`Marker: ${activeMarkerIndex + 1}/${markers.length}`}</span>
				<span> | </span>
				<span>Type:{markerTypeToEmoji(activeMarker.type)}</span>
				<span> | </span>
				<span>Lat: {activeMarker.lat.toFixed(2)}</span>
				<span> | </span>
				<span>Lng: {activeMarker.lng.toFixed(2)}</span>
				{activeMarker.type === 'plane' && (
					<div>
						<span>Distance from you: {activeMarker.distance.toFixed(2)} km</span>
						<span> | </span>
						<span>Origin: {activeMarker.origin}</span>
					</div>
				)}
			</div>
			<div>
				<button
					disabled={markers.length <= 1 || activeMarkerIndex === 0}
					onClick={() => {
						setActiveMarkerId(prev => {
							return markers[activeMarkerIndex - 1].id
						})
					}}
				>
					Prev
				</button>
				<button
					disabled={markers.length <= 1 || activeMarkerIndex === markers.length - 1}
					onClick={() => {
						setActiveMarkerId(prev => {
							return markers[activeMarkerIndex + 1].id
						})
					}}
				>
					Next
				</button>
				<p className="info">🔎  Click earth to toggle zoom</p>
			</div>
		</>
	)
}
export default ControlPanel