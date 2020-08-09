import { handleMouseMove } from './track/handle-mouse-move'
import { Gender } from './track/types/gender.type'
import { saveFeaturesToDb } from './track/track'
const search = new URLSearchParams(window.location.search)

const $start = document.querySelector<HTMLElement>('#start') as HTMLElement
const $button = document.querySelector<HTMLElement>('#button') as HTMLElement
const $title = document.querySelector<HTMLElement>('#title') as HTMLElement
const $container = document.querySelector<HTMLElement>(
  '#container'
) as HTMLElement

const positions: Array<Array<number>> = []
const neededClicks = 10

const buttonWidth = 80
const buttonHeight = 40
const padding = 20

if (search.has('t')) {
  localStorage.setItem('t', search.get('t') as string)
  window.location.replace(window.location.origin)
}

if (localStorage.getItem('t') === null) {
  $title.innerHTML = 'Hello'
  $start.style.display = 'none'
}

const gender = localStorage.getItem('t') === '0' ? Gender.MALE : Gender.FEMALE

for (let i = 0; i < neededClicks + 1; i++) {
  positions.push([
    Math.round(Math.random() * (800 - buttonWidth - padding)),
    Math.round(Math.random() * (600 - buttonHeight - padding))
  ])
}

const mouseEventHandler = handleMouseMove(gender)

let clicks = 0
function showButton() {
  if (clicks === neededClicks) {
    document.removeEventListener('mousemove', mouseEventHandler)
    $button.style.display = 'none'
    $container.style.display = 'none'
    $title.style.display = 'inline-block'
    $title.innerHTML = 'Köszönöm! Bezárhatod az ablakot.'
    return
  }
  $button.style.display = 'inline-block'
  $button.style.left = `${positions[clicks][0]}`
  $button.style.top = `${positions[clicks][1]}`

  $button.innerHTML = `Katt ide!`
  clicks++
}

$start.addEventListener('click', () => {
  $title.style.display = 'none'
  $start.style.display = 'none'
  $container.style.display = 'inline-block'

  $button.addEventListener('click', showButton)
  showButton()

  saveFeaturesToDb()
  document.addEventListener('mousemove', mouseEventHandler)
})
