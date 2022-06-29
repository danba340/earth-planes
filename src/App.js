import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from "@react-three/drei";

import Earth from './components/Earth';

import usePlanes from './usePlanes';
import ControlPanel from './components/ControlPanel';

// Initial marker, before user is found
const nullIslandMarker = {
  id: "nullIsland",
  lat: 0,
  lng: 0,
}

export default function App() {
  const [userLocation, setUserLocation] = useState(null)
  const [activeMarkerId, setActiveMarkerId] = useState("nullIsland");
  const planes = usePlanes(userLocation, 11000)

  // Helper variables for conditionals
  const markers = userLocation ? [{ id: 'me', type: "me", ...userLocation }, ...planes] : [nullIslandMarker]
  const activeMarker = markers.find(m => m.id === activeMarkerId);

  // Get user location and save to markers and set active marker to user location marker
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const { latitude, longitude } = position.coords;
        console.log("User position found:", latitude, longitude)
        setActiveMarkerId("me")
        setUserLocation({ lat: latitude, lng: longitude });
      }, function (err) {
        alert(`There was an error getting your location`)
      });
    } else {
      alert("This site requires Geolocation to work");
    }
  }, [setUserLocation])

  // If active marker plane gets removed, default to user marker
  useEffect(() => {
    if (planes.length && !planes.find(m => m.id === activeMarkerId)) {
      setActiveMarkerId("me");
    }
  }, [activeMarkerId, planes])

  return (
    <>
      <Canvas style={{ height: 'calc(100vh - 170px)', width: '100vw' }} >
        <pointLight position={[10, 5, 10]} intensity={1} />
        <Suspense fallback={null}>
          <Earth
            marker={activeMarker || {}}
          />
        </Suspense>
        <Stars />
      </Canvas>
      <div className="title">
        <h1>3D Nearby Plane Tracker</h1>
      </div>
      <ControlPanel markers={markers} activeMarkerId={activeMarkerId} setActiveMarkerId={setActiveMarkerId} />
    </>
  )
}