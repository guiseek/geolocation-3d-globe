import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import {
  createPoint,
  createEarth,
  findNearCity,
  getPosition,
  getPositionFromCoords,
} from './utilities'
import './style.scss'

const canvas = document.querySelector('canvas')!
const h1 = document.querySelector('h1')!

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

/**
 * Cria cena visual
 */
const scene = new THREE.Scene()

/**
 * Configuração da câmera
 */
const aspect = innerWidth / innerHeight
const camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 100)
camera.aspect = aspect

camera.position.set(0.5, 2, 1)

onresize = () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
}

const controls = new OrbitControls(camera, canvas)
controls.maxZoom = 0.1

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

let mesh: THREE.Mesh = createEarth()
scene.add(mesh)

let currentMesh = mesh

/**
 * Acompanha geolocalização do usuário
 * e atualiza posição no globo virtual
 */
const fetchCities = fetch('cities.json').then((res) => res.json())

getPosition().subscribe(({coords}) => {
  const mesh = createPoint()

  currentMesh.add(mesh)

  let [x, y, z] = getPositionFromCoords(coords.latitude, coords.longitude, 0.5)
  mesh.position.add(new THREE.Vector3(x, y, z))
  fetchCities.then((cities: City[]) => {
    const {city, country} = findNearCity(cities, coords)
    h1.textContent = `${city}, ${country}`
  })
})

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

let isDragging = false

document.ontouchstart = () => (isDragging = true)
document.onmousedown = () => (isDragging = true)
document.ontouchend = () => (isDragging = false)
document.onmouseup = () => (isDragging = false)

const updateFcts: ((delta: number, now: number) => void)[] = []

/**
 * Adiciona função de atualização
 * Controla eixo x e y da rotação
 * com relação a posição do mouse
 */
updateFcts.push((delta: number) => {
  if (isDragging) return

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
updateFcts.push(() => renderer.render(scene, camera))

/**
 * Animation Frame (Game Loop)
 */
let lastUpdate: number
requestAnimationFrame(function animate(currentTime) {
  requestAnimationFrame(animate)

  // Medição do tempo: última hora em ms
  lastUpdate = lastUpdate || currentTime - 1000 / 60
  const deltaTime = Math.min(200, currentTime - lastUpdate)
  lastUpdate = currentTime

  controls.update()

  // Chama funções de controle e renderização a cada frame
  updateFcts.forEach((updateFn) => {
    updateFn(deltaTime / 1000, currentTime / 1000)
  })
})
