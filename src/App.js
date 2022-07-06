import { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber';
import { Stars } from "@react-three/drei";

import Earth from './components/Earth'
import ControlPanel from './components/ControlPanel'
import useGeoloaction from './hooks/useGeolocation';
import { useEffect } from 'react';
import usePlanes from './hooks/usePlanes';

const nullIsland = {
  id: 'nullIsland',
  type: 'island',
  lat: 0,
  lng: 0,
}

export default function App() {
  const [activeMarkerId, setActiveMarkerId] = useState('nullIsland')
  const userLocation = useGeoloaction()
  const planes = usePlanes(userLocation)

  const markers = useMemo(() => userLocation ? [{ id: 'me', type: 'person', ...userLocation }, ...planes] : [nullIsland], [userLocation, planes])

  // If current marker id is no longer in markers list, default to first item in the marker list
  useEffect(() => {
    const activeMarker = markers.find(marker => marker.id === activeMarkerId)
    if (!activeMarker) {
      setActiveMarkerId(markers[0].id)
    }
  }, [userLocation, activeMarkerId, markers])

  const activeMarker = markers.find(marker => marker.id === activeMarkerId)

  return (
    <>
      <div className="title">
        <h1>3D Nearby Plane Tracker</h1>
      </div>
      <Canvas style={{
        height: 'calc(100vh - 170px)',
        width: '100vw'
      }}>
        <pointLight position={[10, 5, 10]} intensity={1} />
        <Stars />
        <Earth marker={activeMarker || nullIsland} />
      </Canvas>
      <div className="controls">
        <ControlPanel markers={markers} activeMarkerId={activeMarkerId} setActiveMarkerId={setActiveMarkerId} />
      </div>
    </>
  )
}