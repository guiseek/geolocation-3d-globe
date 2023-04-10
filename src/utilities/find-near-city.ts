import {getDistance} from './get-distance'

export const findNearCity = (cities: City[], position: Position) => {
  const distances = cities.map((city) => getDistance(city, position))
  const minDistance = Math.min(...distances)
  return cities[
    cities.findIndex((city) => getDistance(city, position) === minDistance)
  ]
}
