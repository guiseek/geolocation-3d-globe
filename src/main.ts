import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import './style.scss'
import {createPoint} from './utilities/create-point'
import {createEarth} from './utilities/create-earth'
import {getPositionFromCoords} from './utilities/get-position-from-coords'

const canvas = document.createElement('canvas')

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
})
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

const updateFcts: ((delta: number, now: number) => void)[] = []

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
const init = () => {
  navigator.geolocation.watchPosition(({coords}) => {
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

let isDragging = false

document.ontouchstart = () => (isDragging = true)
document.onmousedown = () => (isDragging = true)
document.ontouchend = () => (isDragging = false)
document.onmouseup = () => (isDragging = false)

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

  controls.update()

  // Chama funções de controle e renderização a cada frame
  updateFcts.forEach((updateFn) => {
    updateFn(deltaMsec / 1000, nowMsec / 1000)
  })
})
