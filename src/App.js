import React, { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from "@react-three/drei"

import Earth from './components/Earth'

const BOUNDS_SIZE = 2;

function markerInfo(marker) {
  return `lat: ${marker.lat.toFixed(2)}, long: ${marker.lng.toFixed(2)}`;
}

function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

function userPositionFound(markers) {
  return markers.some(m => m.id === "me");
}

function isPlane(marker) {
  return marker.id !== "me"
}

function getUserMarker(markers) {
  return markers.find(m => m.id === "me")
}

export function distance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return ((R * c) / 1000); // in km
}

export default function App() {
  const [markers, setMarkers] = useState([])
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(0);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(function (position) {
        const { latitude, longitude } = position.coords;
        console.log("Latitude is :", position.coords.latitude);
        console.log("Longitude is :", position.coords.longitude);
        const marker = {
          id: "me",
          lat: latitude,
          lng: longitude,
        }
        setMarkers((prev) => {
          return [...prev, marker]
        });
      });
    } else {
      alert("This site requires Geolocation to work");
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (userPositionFound(markers)) {
        const { lat, lng } = getUserMarker(markers);
        const url = `https://opensky-network.org/api/states/all?lamin=${lat - BOUNDS_SIZE}&lomin=${lng - BOUNDS_SIZE}&lamax=${lat + BOUNDS_SIZE}&lomax=${lng + BOUNDS_SIZE}`

        fetch(url).then(res => {
          res.json().then(data => {
            console.log(data)
            if (data.states) {
              const newPlanes = data.states.map(plane => {
                const id = plane[0];
                const lat = plane[6];
                console.log(lat)
                const lng = plane[5];
                return ({ id, lat, lng });
              })
              setMarkers((prev) => {
                const newState = removeDuplicates([...prev, ...newPlanes], 'id')
                return newState;
              });
            }
          })
        })
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [markers])

  const activeMarkerIsPlane = markers.length && isPlane(markers[activeMarkerIndex]);
  return (
    <>
      <Canvas style={{ height: 'calc(100vh - 150px)', width: '100vw' }} >
        <pointLight position={[10, 5, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Earth scale={[2, 2, 2]} isPlane={markers.length && isPlane(markers[activeMarkerIndex])} lat={markers.length ? markers[activeMarkerIndex].lat : null} lng={markers.length ? markers[activeMarkerIndex].lng : null} />
        </Suspense>
        <Stars />
      </Canvas>
      <div className="controls">
        {!markers.length ? (<h3>Nothing to show yet</h3>) : (
          <h3>{activeMarkerIsPlane ? "Plane" : "You"} {markers.length > 1 ? `${activeMarkerIndex + 1}/${markers.length}` : ''} | {markerInfo(markers[activeMarkerIndex])}{activeMarkerIsPlane ? `| Distance to you: ${distance(getUserMarker(markers).lat, getUserMarker(markers).lng, markers[activeMarkerIndex].lat, markers[activeMarkerIndex].lng).toFixed(2)} km` : ''}</h3>
        )}
        <button
          disabled={!markers.length || activeMarkerIndex === 0}
          onClick={() => {
            setActiveMarkerIndex(prev => {
              return prev - 1;
            })
          }}
        >Prev</button>
        <button
          disabled={!markers.length || activeMarkerIndex === markers.length - 1}
          onClick={() => {
            setActiveMarkerIndex(prev => {
              return prev + 1;
            })
          }}
        >Next</button>
      </div>
    </>
  )
}