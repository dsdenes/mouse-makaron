// @ts-ignore
// import KNN from 'ml-knn'
import { dba, db } from '../firebase'
import { CurveFeatures } from './types/curve-features.type'
import { Gender } from './types/gender.type'
import { curveFeaturesEvents, clickFeaturesEvents } from './handle-mouse-events'
import { ClickFeatures } from './types/click-features.type'

const dbCurves = dba('curves')
const dbClicks = dba('clicks')
const dbSessions = dba('sessions')

export function persistToDb() {
  curveFeaturesEvents.removeAllListeners('curveFeatures')
  curveFeaturesEvents.addListener(
    'curveFeatures',
    (curveFeatures: CurveFeatures) => {
      dbCurves.add(curveFeatures)
    }
  )

  clickFeaturesEvents.removeAllListeners('clickFeatures')
  clickFeaturesEvents.addListener(
    'clickFeatures',
    (clickFeatures: ClickFeatures) => {
      dbClicks.add(clickFeatures)
    }
  )
}

// function getCurveFeatures(label: string): CurveFeatures[] {
//   return JSON.parse(localStorage.getItem(label) as string)
// }

// const userCurveFeatures: CurveFeatures[] = []

// let evaluateUserTimer: NodeJS.Timeout
// export function evaluateUser() {
//   try {
//     clearTimeout(evaluateUserTimer)
//   } catch {}

//   if (userCurveFeatures.length > 5) {
//     const maleTrainFeatures = getCurveFeatures(Gender.MALE)
//     const maleTrainData = maleTrainFeatures.map((trainFeatures) =>
//       // @ts-ignore
//       Object.values(trainFeatures)
//     )
//     const maleLabels = Array.from(
//       { length: maleTrainFeatures.length },
//       () => Gender.MALE
//     )
//     const femaleTrainFeatures = getCurveFeatures(Gender.FEMALE)

//     const femaleTrainData = femaleTrainFeatures.map((trainFeatures) =>
//       // @ts-ignore
//       Object.values(trainFeatures)
//     )
//     const femaleLabels = Array.from(
//       { length: femaleTrainFeatures.length },
//       () => Gender.FEMALE
//     )

//     const knn = new KNN(
//       [...maleTrainData, ...femaleTrainData],
//       [...maleLabels, ...femaleLabels]
//     )

//     const predictions = userCurveFeatures.map((curveFeatures) => {
//       // @ts-ignore
//       return knn.predict(Object.values(curveFeatures))
//     })
//     userCurveFeatures.length = 0

//     const result = predictions.reduce(
//       (result, prediction) => {
//         if (prediction === Gender.MALE) {
//           result[Gender.MALE] += 1
//         }

//         if (prediction === Gender.FEMALE) {
//           result[Gender.FEMALE] += 1
//         }

//         return result
//       },
//       { [Gender.MALE]: 0, [Gender.FEMALE]: 0 }
//     )
//     const predEl = document.getElementById('result') as HTMLDivElement
//     predEl.innerHTML = JSON.stringify(result, null, 2)
//   }
//   evaluateUserTimer = setTimeout(evaluateUser, 2000)
// }
