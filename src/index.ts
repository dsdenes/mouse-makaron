import { handleMouseMove } from './track'
import $ from 'jquery'
const search = new URLSearchParams(window.location.search)

if (search.has('t')) {
  localStorage.setItem('t', search.get('t') as string)
  window.location.replace(window.location.origin)
}

const $start = $('#start')
const $button = $('#button')
const $title = $('#title')
const $container = $('#container')

const positions: Array<Array<number>> = []
const neededClicks = 10

const buttonWidth = 80
const buttonHeight = 40
const padding = 20

for (let i = 0; i < neededClicks + 1; i++) {
  positions.push([
    Math.round(Math.random() * (800 - buttonWidth - padding)),
    Math.round(Math.random() * (600 - buttonHeight - padding))
  ])
}

let clicks = 0
function showButton(step: number) {
  if (clicks === neededClicks) {
    document.removeEventListener('mousemove', handleMouseMove)
    $button.hide()
    $container.hide()
    $title.show()
    $title.html('Köszönöm! Bezárhatod az ablakot.')
    return
  }
  $button.show()
  $button.css({
    left: positions[clicks][0],
    top: positions[clicks][1]
  })
  $button.off()
  $button.on('click', () => showButton(step + 1))
  $button.html(`Katt ide!`)
  clicks++
}

$start.on('click', () => {
  $title.hide()
  $start.hide()
  $container.show()
  showButton(0)
  document.addEventListener('mousemove', handleMouseMove)
})
