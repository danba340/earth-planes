import { useState } from 'react'

import ControlPanel from './components/ControlPanel'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import Earth from './components/Earth'
import useGeoloaction from './hooks/useGeolocation'
import usePlanes from './hooks/usePlanes'

export default function App() {
  const userLocation = useGeoloaction()
  const [activeMarkerId, setActiveMarkerId] = useState('me')
  const planes = usePlanes(userLocation || { lat: 0, lon: 0 })

  const markers = userLocation ? [
    { id: 'me', type: 'human', ...userLocation },
    ...planes
  ] : [
    ...planes
  ]
  const activeMarker = markers.find(marker => marker.id === activeMarkerId)

  console.log('active marker', activeMarker)

  return (
    <>
      <div className="title">
        <h1>3D Nearby Plane Tracker</h1>
      </div>
      <Canvas style={{
        height: 'calc(100vh - 170px)',
        width: '100vw',
      }}>
        <pointLight position={[10, 5, 10]} />
        <Stars />
        <Earth marker={activeMarker || { lat: 0, lon: 0 }} />
      </Canvas>
      <div className="controls">
        <ControlPanel markers={markers} activeMarkerId={activeMarkerId} setActiveMarkerId={setActiveMarkerId} />
      </div>
    </>
  )
}