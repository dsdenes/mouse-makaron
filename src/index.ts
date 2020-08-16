import { handleMouseMove, handleClick } from './track/handle-mouse-events'
import { Gender } from './track/types/gender.type'
import { persistToDb } from './track/track'
import { positions } from './track/positions'
const search = new URLSearchParams(window.location.search)

const $start = document.querySelector<HTMLElement>('#start') as HTMLElement
const $button = document.querySelector<HTMLElement>('#button') as HTMLElement
const $title = document.querySelector<HTMLElement>('#title') as HTMLElement
const $container = document.querySelector<HTMLElement>(
  '#container'
) as HTMLElement

const neededClicks = 20

if (search.has('t')) {
  localStorage.setItem('t', search.get('t') as string)
  window.location.replace(window.location.origin)
}

if (localStorage.getItem('t') === null) {
  $title.innerHTML = 'Hello'
  $start.style.display = 'none'
}

const gender = localStorage.getItem('t') === '0' ? Gender.MALE : Gender.FEMALE

const mouseMoveHandler = handleMouseMove(gender)
const mouseClickHandler = handleClick(gender)

let clicks = 0
function showButton() {
  if (clicks === neededClicks) {
    document.removeEventListener('mousemove', mouseMoveHandler)
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

  persistToDb()
  document.addEventListener('mousemove', mouseMoveHandler)
  document.addEventListener('mousedown', mouseClickHandler)
  document.addEventListener('mouseup', mouseClickHandler)
  document.addEventListener('click', mouseClickHandler)
})
