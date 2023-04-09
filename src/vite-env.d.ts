/// <reference types="vite/client" />

type Position = Pick<GeolocationCoordinates, 'latitude' | 'longitude'>
interface Neighborhood {
  id_municipio: number
  id_bairro: number
  uf: string
  municipio: string
  bairro: string
  latitude: number
  longitude: number
}