import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from "@react-three/drei";

import useInterval from "./useInterval";
import Earth from './components/Earth';

import {
  markerInfo,
  userPositionFound,
  getUserMarker,
  distance,
  calcRotation,
  coordinateChange,
} from './utils';

// Create Bounding square with BOUNDS_SIZE * 2 sides, to look for planes in
const BOUNDS_SIZE = 2;

// Initial marker, before user is found
const nullIslandMarker = {
  id: "nullIsland",
  lat: 0,
  lng: 0,
}

export default function App() {
  const [markers, setMarkers] = useState([])
  const [activeMarkerId, setActiveMarkerId] = useState("");

  // Helper variebles for conditionals
  const activeMarkerIndex = markers.findIndex(m => m.id === activeMarkerId);
  const hasMarker = activeMarkerIndex !== -1;
  const activeMarkerIsPlane = activeMarkerId !== "me" && activeMarkerId.length;

  // Get user location and save to markers and set active marker to user location marker
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const { latitude, longitude } = position.coords;
        console.log("User position found:", latitude, longitude)

        const userMarker = {
          id: "me",
          lat: latitude,
          lng: longitude,
        }
        setMarkers((prev) => {
          const withoutMe = prev.filter(m => m.id !== 'me');
          return [...withoutMe, userMarker];
        });
        setActiveMarkerId("me");
      }, function (err) {
        alert(`There was an error getting your location`)
      });
    } else {
      alert("This site requires Geolocation to work");
    }
  }, [])

  // Fetch planes and save in markers
  const fetchPlanes = useCallback(() => {
    const { lat, lng } = getUserMarker(markers);
    const url = `https://opensky-network.org/api/states/all?lamin=${lat - BOUNDS_SIZE}&lomin=${lng - BOUNDS_SIZE}&lamax=${lat + BOUNDS_SIZE}&lomax=${lng + BOUNDS_SIZE}`

    fetch(url).then(res => {
      res.json().then(data => {
        if (data.states) {
          const incomingPlanes = data.states.map(plane => {
            const id = plane[0];
            const lat = plane[6];
            const lng = plane[5];
            return ({ id, lat, lng, rotation: 0 });
          })
          setMarkers((prev) => {
            const userMarker = getUserMarker(prev);
            const currPlanes = prev.filter(p => p.id !== "me");
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

            const newState = unionPlanes.length ? [userMarker, ...unionPlanes, ...newPlanes] : [userMarker, ...incomingPlanes];

            console.log(`${unionPlanes.length} updated 🛩  ${newPlanes.length} new 🛩 `);


            return newState;
          });
        }
      })
    })
  }, [markers])

  // Fetch planes every 11s due to API throttling
  useInterval(() => {
    if (markers.length && userPositionFound(markers)) {
      fetchPlanes();
    }
  }, 11000);

  // Trigger fetch once users position is found
  useEffect(() => {
    if (markers.length === 1 && userPositionFound(markers)) {
      fetchPlanes()
    }
  }, [markers, fetchPlanes])

  // If active marker plane gets removed, default to user marker
  useEffect(() => {
    if (markers.length && !markers.find(m => m.id === activeMarkerId)) {
      setActiveMarkerId("me");
    }
  }, [activeMarkerId, markers])

  return (
    <>
      <Canvas style={{ height: 'calc(100vh - 170px)', width: '100vw' }} >
        <pointLight position={[10, 5, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Earth
            marker={markers.length && hasMarker ? markers[activeMarkerIndex] : nullIslandMarker}
          />
        </Suspense>
        <Stars />
      </Canvas>
      <div className="title">
        <h1>3D Nearby Plane Tracker</h1>
      </div>
      <div className="controls">
        {!markers.length || !hasMarker ? (<h3>Nothing to show yet. Loading...</h3>) : (
          <h3>{markers.length > 1 ? `Index: ${activeMarkerIndex + 1}/${markers.length} | ` : ''}Type:{activeMarkerIsPlane ? "🛩" : "🧍🏻"}  | {markerInfo(markers[activeMarkerIndex])}{activeMarkerIsPlane ? ` | Distance to you: ${distance(getUserMarker(markers).lat, getUserMarker(markers).lng, markers[activeMarkerIndex].lat, markers[activeMarkerIndex].lng).toFixed(2)} km` : ''}</h3>
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
        {markers.length === 1 && ("🌎 Found you. 🛩 Loading planes...")}
      </div>
    </>
  )
}