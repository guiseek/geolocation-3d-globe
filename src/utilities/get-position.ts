import {from} from 'rxjs'

export const getPosition = () => {
  const promise = new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.watchPosition(resolve, reject)
  })
  return from(promise)
}
