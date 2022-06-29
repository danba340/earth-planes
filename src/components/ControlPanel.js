import {
	markerInfo,
	getUserMarker,
} from '../utils';

export default function ControlPanel({ markers, activeMarkerId, setActiveMarkerId }) {
	const activeMarker = markers.find(m => m.id === activeMarkerId);
	const activeMarkerIndex = markers.findIndex(m => m.id === activeMarkerId);
	const userMarker = getUserMarker(markers)
	return (
		<div className="controls">
			{(!markers.length || !userMarker) ? (<h3>Nothing to show yet. Loading...</h3>) : (
				<h3>{markers.length > 0 ? `Index: ${activeMarkerIndex + 1}/${markers.length} | ` : ''}Type:{activeMarker.type === "plane" ? "🛩" : "🧍🏻"}  | {markerInfo(activeMarker)}{activeMarker.type === "plane" ? ` | Distance to you: ${activeMarker.distance.toFixed(2)} km` : ''}</h3>
			)}
			{markers.length > 1 && (
				<>
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
			)}
			{(markers.length === 1 && activeMarkerId === 'me') && ("🌎 Found you. 🛩 Loading planes...")}
		</div>
	)
}