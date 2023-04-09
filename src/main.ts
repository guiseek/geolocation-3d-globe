import * as THREE from 'three'
import './style.scss'

const renderer = new THREE.WebGLRenderer({
  antialias: true,
})
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const updateFcts: ((delta: number, now: number) => void)[] = []

/**
 * Cria cena visual
 */
const scene = new THREE.Scene()

/**
 * Configuração da câmera
 */
const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.01,
  100
)
camera.position.z = 1.5

/**
 * Configuração de iluminação
 */
let light: THREE.AmbientLight | THREE.DirectionalLight = new THREE.AmbientLight(
  0x666666
)

scene.add(light)

light = new THREE.DirectionalLight('white', 1)
light.position.set(5, 5, 5)
light.target.position.set(0, 0, 0)
// scene.add( light )

light = new THREE.DirectionalLight(0xcccccc, 1)
scene.add(light)
light.castShadow = true

/**
 * Cria globo terrestre virtual
 */
const createEarth = () => {
  const geometry = new THREE.SphereGeometry(0.5, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('globe.jpg'),
  })
  const mesh = new THREE.Mesh(geometry, material)

  return mesh
}

/**
 * Cria marcador de posição
 */
const createPoint = () => {
  const geometry = new THREE.SphereGeometry(0.005, 20, 20)
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color('lime'),
  })
  return new THREE.Mesh(geometry, material)
}

function getPositionFromCoords(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return [x, y, z]
}

let mesh: THREE.Mesh = createEarth()
scene.add(mesh)

let currentMesh = mesh

/**
 * Acompanha geolocalização do usuário
 * e atualiza posição no globo virtual
 */
const init = () => {
  navigator.geolocation.watchPosition(({coords}) => {
    console.log(coords)
    const mesh = createPoint()

    currentMesh.add(mesh)

    let latlonpoint = getPositionFromCoords(
      coords.latitude,
      coords.longitude,
      0.5
    )
    mesh.position.add(
      new THREE.Vector3(latlonpoint[0], latlonpoint[1], latlonpoint[2])
    )
  })
}

document.onclick = init

/**
 * Intercepta eventos do mouse e atualiza
 * posição x e y para controle de rotação
 */
const mouse = {x: 0, y: 0}
document.addEventListener(
  'mousemove',
  ({clientX, clientY}) => {
    mouse.x = clientX / innerWidth - 0.5
    mouse.y = clientY / innerHeight - 0.5
  },
  false
)

/**
 * Adiciona função de atualização
 * Controla eixo x e y da rotação
 * com relação a posição do mouse
 */
updateFcts.push((delta: number) => {
  currentMesh.rotation.y -= mouse.x * 1 * (delta * 1)

  if (currentMesh.rotation.x <= 1 && currentMesh.rotation.x >= -1) {
    currentMesh.rotation.x -= mouse.y * 1 * (delta * 1)
  }
  if (currentMesh.rotation.x >= 1) {
    currentMesh.rotation.x += mouse.y * 1 * (delta * 1)
  }
  if (currentMesh.rotation.x <= -1) {
    currentMesh.rotation.x += mouse.y * 1 * (delta * 1)
  }

  camera.lookAt(scene.position)
})

// Adiciona função de renderização
updateFcts.push(() => {
  renderer.render(scene, camera)
})

/**
 * Animation Frame (Game Loop)
 */
let lastTimeMsec: number
requestAnimationFrame(function animate(nowMsec) {
  requestAnimationFrame(animate)

  // Medição do tempo: última hora em ms
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
  const deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
  lastTimeMsec = nowMsec

  // Chama funções de controle e renderização a cada frame
  updateFcts.forEach((updateFn) => {
    updateFn(deltaMsec / 1000, nowMsec / 1000)
  })
})
