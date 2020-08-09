// @ts-ignore
// import KNN from 'ml-knn'
import { dba, db } from '../firebase'
import { CurveFeatures } from './types/curve-features.type'
import { Gender } from './types/gender.type'
import { curveFeaturesEvents } from './handle-mouse-move'

const dbCurves = dba('curves')

export function saveFeaturesToDb() {
  curveFeaturesEvents.removeAllListeners('features')
  curveFeaturesEvents.addListener('features', handleFeatures)
}

function handleFeatures(features: CurveFeatures) {
  dbCurves.add(features)
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
