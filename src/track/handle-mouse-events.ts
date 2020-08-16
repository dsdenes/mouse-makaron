import { Gender } from './types/gender.type'
import { TrackEvent } from './types/track-event.type'
import { CurveFeatures } from './types/curve-features.type'
import { EventEmitter } from './event-emitter'

export const curveFeaturesEvents = new EventEmitter()
export const clickFeaturesEvents = new EventEmitter()

let currentCurveLastEvent: number | undefined
const currentCurvePoints: TrackEvent[] = []
const currentCurve: TrackEvent[][] = []
let clickStartedAt: number | undefined
let clickDuration: number | undefined
let lastMoveEventAt: number | undefined

export const handleClick = (gender: Gender) => {
  let startEvent: MouseEvent | undefined
  let movedDuringClick: number | undefined
  return (event: MouseEvent) => {
    if (!gender) {
      return
    }

    if (event.type === 'mousedown' && clickDuration === undefined) {
      clickStartedAt = performance.now()
      startEvent = event
    }

    if (
      event.type === 'mouseup' &&
      clickStartedAt !== undefined &&
      startEvent !== undefined
    ) {
      const movementX = event.screenX - startEvent.screenX
      const movementY = event.screenY - startEvent.screenY
      movedDuringClick = Math.sqrt(
        Math.pow(movementX, 2) + Math.pow(movementY, 2)
      )
      clickDuration = performance.now() - clickStartedAt
    }

    if (
      event.type === 'click' &&
      clickDuration !== undefined &&
      movedDuringClick !== undefined &&
      lastMoveEventAt !== undefined
    ) {
      clickFeaturesEvents.emit('clickFeatures', {
        g: gender,
        d: clickDuration,
        m: movedDuringClick,
        s: performance.now() - lastMoveEventAt
      })
      clickStartedAt = undefined
      clickDuration = undefined
    }
  }
}

export const handleMouseMove = (gender: Gender) => (event: MouseEvent) => {
  if (!gender) {
    return
  }

  lastMoveEventAt = performance.now()

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

  curveFeaturesEvents.emit('curveFeatures', features)
}
