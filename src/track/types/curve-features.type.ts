import { Gender } from './gender.type'

export interface CurveFeatures {
  gender: Gender
  size: number
  sumDistance: number
  sumTime: number
  avgCurveSpeed: number
  avgCurveVelocity: number
  avgVelocity: number
  sdVelocity: number
}
