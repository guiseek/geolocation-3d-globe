export const distanceUnit = (distance: number) => {
  if (distance >= 1) {
    let km = distance.toFixed(1)
    return km + ' km'
  } else {
    let meters = distance * 1000
    return meters.toFixed(0) + ' m'
  }
}
