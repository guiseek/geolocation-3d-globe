import {Subject} from 'rxjs'

export class GeoHandler {
  static NEIGHBORHOODS: Neighborhood[] = []

  #position = new Subject<Position>()
  position$ = this.#position.asObservable()

  loadCurrentPosition() {
    navigator.geolocation.getCurrentPosition(({coords}) => {
      this.#position.next(coords)
    })
  }

  listenPosition() {
    navigator.geolocation.watchPosition(
      ({coords}) => {
        this.#position.next(coords)
      },
      (error) => {
        console.error(error)
      },
      {
        enableHighAccuracy: true,
      }
    )
  }

  #getCoordToRadians(diffCoord: number): number {
    return diffCoord * (Math.PI / 180)
  }

  async loadLocations(url: string) {
    if (!GeoHandler.NEIGHBORHOODS.length) {
      return fetch(url)
        .then((res) => res.json())
        .then((data: Neighborhood[]) => {
          GeoHandler.NEIGHBORHOODS = data
        })
    }
    return
  }

  findNearLocation(position: Position) {
    const distances = GeoHandler.NEIGHBORHOODS.map(({latitude, longitude}) => {
      return this.getDistance({latitude, longitude}, position)
    }).filter((distance) => !isNaN(distance)) as number[]

    const lowerDistance = Math.min(...distances)
    const index = distances.findLastIndex(
      (distance) => distance === lowerDistance
    )
    return GeoHandler.NEIGHBORHOODS[index]
  }

  getDistance(originCoords: Position, targetCoords: Position): number {
    const R = 6371
    let diffLatitude = this.#getCoordToRadians(
      originCoords.latitude - targetCoords.latitude
    )
    let diffLongitude = this.#getCoordToRadians(
      originCoords.longitude - targetCoords.longitude
    )
    let a =
      Math.sin(diffLatitude / 2) * Math.sin(diffLatitude / 2) +
      Math.cos(this.#getCoordToRadians(originCoords.latitude)) *
        Math.cos(this.#getCoordToRadians(targetCoords.latitude)) *
        Math.sin(diffLongitude / 2) *
        Math.sin(diffLongitude / 2)
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    let d = R * c

    return d
  }

  getMetersOrKilometers(distance: number): string {
    if (distance >= 1) {
      let km = distance.toFixed(1)
      return km + ' km'
    } else {
      let meters = distance * 1000
      return meters.toFixed(0) + ' m'
    }
  }
}
