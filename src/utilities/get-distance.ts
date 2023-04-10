const getCoordToRadians = (diffCoord: number) => {
  return diffCoord * (Math.PI / 180)
}

export const getDistance = (origin: Position, target: Position) => {
  const R = 6371
  let diffLatitude = getCoordToRadians(origin.latitude - target.latitude)
  let diffLongitude = getCoordToRadians(origin.longitude - target.longitude)
  let a =
    Math.sin(diffLatitude / 2) * Math.sin(diffLatitude / 2) +
    Math.cos(getCoordToRadians(origin.latitude)) *
      Math.cos(getCoordToRadians(target.latitude)) *
      Math.sin(diffLongitude / 2) *
      Math.sin(diffLongitude / 2)
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  let d = R * c

  return d
}
