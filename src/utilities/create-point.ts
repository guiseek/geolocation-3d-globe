import * as THREE from 'three'

/**
 * Cria marcador de posição
 */
export const createPoint = () => {
  const geometry = new THREE.SphereGeometry(0.005, 20, 20)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('lime'),
  })
  return new THREE.Mesh(geometry, material)
}
