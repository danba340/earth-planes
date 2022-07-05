import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from "@react-three/drei";

import Earth from './components/Earth';
import usePlanes from './hooks/usePlanes';
import useUserLocation from './hooks/useUserLocation';
import ControlPanel from './components/ControlPanel';

// Initial marker, before user is found
const nullIslandMarker = {
  id: "nullIsland",
  lat: 0,
  lng: 0,
}

export default function App() {
  const userLocation = useUserLocation()
  const [activeMarkerId, setActiveMarkerId] = useState("nullIsland");
  const planes = usePlanes(userLocation, 11000)

  // Helper variables for conditionals
  const markers = [userLocation ? { id: 'me', type: "me", ...userLocation } : nullIslandMarker, ...planes]
  const activeMarker = markers.find(m => m.id === activeMarkerId);

  // If active marker plane gets removed, default to user marker
  useEffect(() => {
    if (!activeMarker) {
      setActiveMarkerId(userLocation ? "me" : "nullIsland");
    }
  }, [activeMarker, userLocation])

  // Once userLocation is found set active Marker to user
  useEffect(() => {
    if (userLocation) {
      setActiveMarkerId("me");
    }
  }, [userLocation])

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