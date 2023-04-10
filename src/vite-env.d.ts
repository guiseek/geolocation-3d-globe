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

interface Array<T> {
  findLastIndex(
    predicate: (value: number, index: number, array: number[]) => unknown,
    thisArg?: any
  ): number
}

interface City {
  city: string
  city_ascii: string
  latitude: number
  longitude: number
  country: string
  iso2: string
  iso3: string
  admin_name: string
  capital: Capital
  population: number | string
  id: number
}

enum Capital {
  Admin = 'admin',
  Empty = '',
  Minor = 'minor',
  Primary = 'primary',
}
