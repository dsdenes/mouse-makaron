import { Gender } from './types/gender.type'
import { TrackEvent } from './types/track-event.type'
import { CurveFeatures } from './types/curve-features.type'
const EventEmitter = require('events')

export const curveFeaturesEvents = new EventEmitter() as NodeJS.EventEmitter

let currentCurveLastEvent: number | undefined
const currentCurvePoints: TrackEvent[] = []
const currentCurve: TrackEvent[][] = []

export const handleMouseMove = (gender: Gender) => (event: MouseEvent) => {
  if (!gender) {
    return
  }

  if (currentCurveLastEvent === undefined) {
    currentCurveLastEvent = performance.now()
  }

  if (performance.now() - currentCurveLastEvent > 200) {
    currentCurve.push([...currentCurvePoints])
    currentCurvePoints.length = 0
    setTimeout(() => processCurves(gender), 0)
  }

  currentCurveLastEvent = performance.now()
  currentCurvePoints.push({
    movementX: event.movementX,
    movementY: event.movementY,
    screenX: event.screenX,
    screenY: event.screenY,
    ts: performance.now()
  } as TrackEvent)
}

let processingCurves: boolean = false
function processCurves(gender: Gender) {
  if (processingCurves) {
    return
  }
  processingCurves = true

  while (currentCurve.length > 0) {
    const curve = currentCurve.shift() as TrackEvent[]

    if (curve.length < 5) {
      continue
    }

    setTimeout(() => processCurve(gender, curve), 0)
  }

  processingCurves = false
}

function processCurve(gender: Gender, curve: TrackEvent[]) {
  const firstEvent = curve[0]
  const lastEvent = curve[curve.length - 1]
  const sumTime = lastEvent.ts - firstEvent.ts

  const sumDistance = curve.reduce((distance, event) => {
    distance =
      distance +
      Math.sqrt(Math.pow(event.movementX, 2) + Math.pow(event.movementY, 2))
    return distance
  }, 0)

  const velocities: number[] = []
  curve.forEach((event, eventIndex) => {
    if (eventIndex === 0) {
      velocities.push(0)
      return
    }
    const prevEvent = curve[eventIndex - 1]
    const movementX = event.screenX - prevEvent.screenX
    const movementY = event.screenY - prevEvent.screenY
    const currTime = event.ts - prevEvent.ts
    const currDistance = Math.sqrt(
      Math.pow(movementX, 2) + Math.pow(movementY, 2)
    )
    // Equals to speed in this context
    const currVelocity = currDistance / currTime
    velocities.push(currVelocity)
  })

  const sumVelocities = velocities.reduce((sumVelocities, velocity) => {
    return sumVelocities + velocity
  }, 0)
  const avgVelocity = sumVelocities / curve.length
  const sdVelocityAccu = velocities.reduce((sdVelocityAccu, velocity) => {
    return sdVelocityAccu + Math.pow(velocity - avgVelocity, 2)
  }, 0)

  const sdVelocity = Math.sqrt(sdVelocityAccu / curve.length)

  const avgCurveSpeed = sumDistance / sumTime

  const movementX = lastEvent.screenX - firstEvent.screenX
  const movementY = lastEvent.screenY - firstEvent.screenY
  const avgCurveVelocity =
    Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2)) / sumTime

  const features: CurveFeatures = {
    gender,
    size: curve.length,
    sumDistance,
    sumTime,
    avgCurveSpeed,
    avgCurveVelocity,
    avgVelocity,
    sdVelocity
  }

  curveFeaturesEvents.emit('features', features)
}
