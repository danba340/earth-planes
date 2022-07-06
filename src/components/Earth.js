/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: PatelDev (https://sketchfab.com/PatelDev)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/3d-models/earth-f7a76c63ff1846afb2d606e5c8369c15
title: Earth
*/

import React, { useState, useCallback } from 'react'
import { useGLTF } from '@react-three/drei'
import { useSpring, a } from '@react-spring/three';

import Plane from './Plane'

const LONGITUDE_OFFSET = -Math.PI / 2

export default function Model({ marker }) {
  const [isZoom, setIsZoom] = useState(false)

  const { lat, lng } = marker

  const latRot = (lat * Math.PI / 180);
  const lngRot = -(lng * Math.PI / 180) + LONGITUDE_OFFSET;

  const { scale, earthRotation, markerPosition } = useSpring({
    scale: isZoom ? [4, 4, 4] : [2, 2, 2],
    earthRotation: [latRot, lngRot, 0],
    markerPosition: isZoom ? [0, 0, 4.5] : [0, 0, 2.5]
  })

  const { nodes, materials } = useGLTF('/earth.gltf')

  const handleEarthClick = useCallback(() => {
    setIsZoom(prev => !prev)
  }, [setIsZoom])

  return (
    <>
      <a.group
        onClick={handleEarthClick}
        scale={scale}
        rotation={earthRotation}
        dispose={null}
      >
        <group scale={1.13}>
          <mesh geometry={nodes.Object_4.geometry} material={materials['Scene_-_Root']} />
        </group>
      </a.group>
      {marker.type === 'plane' ? (
        <Plane position={markerPosition} rotation={marker.rotation} markerId={marker.id} />
      ) : (
        <a.mesh position={markerPosition}>
          <sphereGeometry args={[0.01]} />
          <meshStandardMaterial color={'orange'} />
        </a.mesh>
      )
      }
    </>
  )
}

useGLTF.preload('/earth.gltf')
