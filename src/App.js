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
  const markers = [userLocation ? { id: 'me', type: "me", ...userLocation } : nullIslandMarker, ...planes]
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
        alert(`There was an error getting your location, this site need you location in order to show surrounding planes`)
      });
    } else {
      alert(`There was an error getting your location, this site need you location in order to show surrounding planes`)
    }
  }, [])

  // If active marker plane gets removed, default to user marker
  useEffect(() => {
    if (!activeMarker) {
      setActiveMarkerId(userLocation ? "me" : "nullIsland");
    }
  }, [activeMarker, userLocation])

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
      <div className="controls">
        <ControlPanel markers={markers} activeMarkerId={activeMarkerId} setActiveMarkerId={setActiveMarkerId} />
      </div>
    </>
  )
}