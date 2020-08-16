import { Gender } from './gender.type'

export interface ClickFeatures {
  g: Gender
  // Duration of click
  d: number
  // Move during click
  m: number
  // Silence before click
  s: number
}
