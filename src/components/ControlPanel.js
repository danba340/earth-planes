import {
	markerInfo,
	getUserMarker,
	markerTypeToEmoji,
} from '../utils';

export default function ControlPanel({ markers, activeMarkerId, setActiveMarkerId }) {
	const activeMarker = markers.find(m => m.id === activeMarkerId);
	const activeMarkerIndex = markers.findIndex(m => m.id === activeMarkerId);
	const userMarker = getUserMarker(markers)
	if (!userMarker && markers.length === 1) return <div>🛩 Loading planes...</div>
	if (activeMarker && activeMarker.type === "me" && markers.length === 1) return <div>🌎 Found you. 🛩 Loading planes...</div>
	console.log(activeMarker)
	return (
		<>
			{
				activeMarker && markers.length > 1 && (
					<>
						<h3>
							<span>{`Index: ${activeMarkerIndex + 1}/${markers.length}`}</span>
							<span> | </span>
							<span>Type:{markerTypeToEmoji(activeMarker.type)}</span>
							<span>{markerInfo(activeMarker)}</span>
							{activeMarker.type === "plane" && (
								<div>
									<span>Distance to you: ${activeMarker.distance.toFixed(2)} km</span>
									<span> | </span>
									<span>Origin: {activeMarker.origin}</span>
								</div>
							)}
						</h3>
						<div>
							<button
								disabled={!markers.length || activeMarkerIndex === 0}
								onClick={() => {
									setActiveMarkerId(prev => {
										return markers[activeMarkerIndex - 1].id;

									})
								}}
							>Prev</button>
							<button
								disabled={!markers.length || activeMarkerIndex === markers.length - 1}
								onClick={() => {
									setActiveMarkerId(prev => {
										return markers[activeMarkerIndex + 1].id;
									})
								}}
							>Next</button>
						</div>
						<p className="info">🔎  Click earth to toggle zoom</p>
					</>
				)
			}
		</>

	)
}