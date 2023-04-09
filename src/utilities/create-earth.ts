import * as THREE from 'three'

/**
 * Cria globo terrestre virtual
 */
export const createEarth = () => {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('globe.jpg'),
  })
  const mesh = new THREE.Mesh(geometry, material)

  return mesh
}
