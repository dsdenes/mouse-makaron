// @ts-ignore
import KNN from 'ml-knn'
import { dba, db } from './firebase'

const dbCurves = dba('curves')

enum Label {
  MALE = 'male',
  FEMALE = 'female'
}

let gender: Label

assureLocalStorage(Label.MALE)
assureLocalStorage(Label.FEMALE)

function getCurveFeatures(label: string): CurveFeatures[] {
  return JSON.parse(localStorage.getItem(label) as string)
}

async function pushCurveFeatures(label: string, curveFeatures: CurveFeatures) {
  return dbCurves.add(curveFeatures)
}

function assureLocalStorage(key: string): void {
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify([]))
  }
}

interface CurveFeatures {
  size: number
  sumDistance: number
  sumTime: number
  avgCurveSpeed: number
  avgCurveVelocity: number
  avgVelocity: number
  sdVelocity: number
}

interface TrackEvent extends MouseEvent {
  ts: number
}

let curveStart: number | undefined
let curveLast: number | undefined
const curve: TrackEvent[] = []
const curves: TrackEvent[][] = []
const userCurveFeatures: CurveFeatures[] = []

let processingCurves: boolean = false
function processCurves() {
  if (processingCurves) {
    return
  }
  processingCurves = true

  while (curves.length > 0) {
    const curve = curves.shift() as TrackEvent[]

    if (curve.length < 5) {
      continue
    }

    setTimeout(() => processCurve(curve), 0)
  }

  processingCurves = false
}

function processCurve(curve: TrackEvent[]) {
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
    size: curve.length,
    sumDistance,
    sumTime,
    avgCurveSpeed,
    avgCurveVelocity,
    avgVelocity,
    sdVelocity
  }

  if (gender) {
    pushCurveFeatures(gender, features)
  } else {
    userCurveFeatures.push(features)
  }
}

export function handleMouseMove(event: MouseEvent) {
  gender = localStorage.getItem('t') === '0' ? Label.MALE : Label.MALE

  if (!gender) {
    return
  }

  if (curveStart === undefined) {
    curveStart = performance.now()
  }

  if (curveLast === undefined) {
    curveLast = performance.now()
  }

  if (performance.now() - curveLast > 200) {
    curveStart = undefined
    curves.push([...curve])
    curve.length = 0
    setTimeout(processCurves, 0)
  }

  curveLast = performance.now()
  curve.push({
    movementX: event.movementX,
    movementY: event.movementY,
    screenX: event.screenX,
    screenY: event.screenY,
    ts: performance.now()
  } as TrackEvent)
}

let evaluateUserTimer: NodeJS.Timeout
export function evaluateUser() {
  try {
    clearTimeout(evaluateUserTimer)
  } catch {}

  if (userCurveFeatures.length > 5) {
    const maleTrainFeatures = getCurveFeatures(Label.MALE)
    const maleTrainData = maleTrainFeatures.map((trainFeatures) =>
      // @ts-ignore
      Object.values(trainFeatures)
    )
    const maleLabels = Array.from(
      { length: maleTrainFeatures.length },
      () => Label.MALE
    )
    const femaleTrainFeatures = getCurveFeatures(Label.FEMALE)

    const femaleTrainData = femaleTrainFeatures.map((trainFeatures) =>
      // @ts-ignore
      Object.values(trainFeatures)
    )
    const femaleLabels = Array.from(
      { length: femaleTrainFeatures.length },
      () => Label.FEMALE
    )

    const knn = new KNN(
      [...maleTrainData, ...femaleTrainData],
      [...maleLabels, ...femaleLabels]
    )

    const predictions = userCurveFeatures.map((curveFeatures) => {
      // @ts-ignore
      return knn.predict(Object.values(curveFeatures))
    })
    userCurveFeatures.length = 0

    const result = predictions.reduce(
      (result, prediction) => {
        if (prediction === Label.MALE) {
          result[Label.MALE] += 1
        }

        if (prediction === Label.FEMALE) {
          result[Label.FEMALE] += 1
        }

        return result
      },
      { [Label.MALE]: 0, [Label.FEMALE]: 0 }
    )
    const predEl = document.getElementById('result') as HTMLDivElement
    predEl.innerHTML = JSON.stringify(result, null, 2)
  }
  evaluateUserTimer = setTimeout(evaluateUser, 2000)
}
