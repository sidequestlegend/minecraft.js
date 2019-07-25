/**
 * F3 utilities
 */
import Helpers from '../../../utils/helpers'
import BlockDict from '../../../config/blockDict'

import classes from './debug.module.css'

function Debug(container, player, world) {
  let display = process.env.NODE_ENV === 'development'

  let maxFPS = null
  let minFPS = null

  let daysVal = 0

  /* -------------------------------------------------------------------------- */
  /*                                   GENERAL                                  */
  /* -------------------------------------------------------------------------- */
  const lineBreak = document.createElement('br')
  const wrapper = document.createElement('div')
  const leftPanel = document.createElement('div')
  const rightPanel = document.createElement('div')

  Helpers.applyStyle(wrapper, classes.wrapper)
  Helpers.applyStyle(leftPanel, classes.leftPanel)
  Helpers.applyStyle(rightPanel, classes.rightPanel)

  wrapper.appendChild(leftPanel)
  wrapper.appendChild(rightPanel)

  if (display) Helpers.applyStyle(wrapper, { display: 'flex' })

  /* -------------------------------------------------------------------------- */
  /*                                 LEFT PANEL                                 */
  /* -------------------------------------------------------------------------- */
  const title = document.createElement('p')
  const coordinates = document.createElement('p')
  const fps = document.createElement('p')
  const days = document.createElement('p')

  title.innerHTML = 'Minecraft JS (dev/beta/vanilla)'
  coordinates.innerHTML = 'XYZ: 0 / 0 / 0'
  fps.innerHTML = '0 fps'
  days.innerHTML = 'Day 0'

  leftPanel.appendChild(title)
  leftPanel.appendChild(coordinates)
  leftPanel.appendChild(fps)
  leftPanel.appendChild(lineBreak)
  leftPanel.appendChild(days)

  /* -------------------------------------------------------------------------- */
  /*                                 RIGHT PANEL                                */
  /* -------------------------------------------------------------------------- */
  const targetedBlockTitle = document.createElement('p')
  const targetedBlock = document.createElement('p')

  targetedBlockTitle.innerHTML = 'Targeted Block'
  targetedBlock.innerHTML = BlockDict['0'].tag

  Helpers.applyStyle(targetedBlockTitle, classes.subSectionTitle)

  rightPanel.appendChild(targetedBlockTitle)
  rightPanel.appendChild(targetedBlock)

  /* -------------------------------------------------------------------------- */
  /*                             GETTERS AND SETTERS                            */
  /* -------------------------------------------------------------------------- */
  this.getGui = () => wrapper

  this.getPlayer = () => player
  this.getWorld = () => world

  this.getDOM_FPS = () => fps
  this.getDOM_coordinates = () => coordinates
  this.getDOM_title = () => title
  this.getDOM_wrapper = () => wrapper
  this.getDOM_targetedBlock = () => targetedBlock
  this.getDOM_days = () => days

  this.setDisplay = bool => (display = bool)
  this.getDisplay = () => display

  this.setMaxFPS = f => (maxFPS = f)
  this.getMaxFPS = () => maxFPS

  this.setMinFPS = f => (minFPS = f)
  this.getMinFPS = () => minFPS

  this.setDaysVal = v => (daysVal = v)
  this.getDaysVal = () => daysVal

  container.appendChild(wrapper)
  player.controls.setDebugControl(this)
}

Debug.prototype.calcFPS = (function() {
  let lastLoop = new Date().getMilliseconds()
  let count = 1
  let fps = 0

  return function() {
    const currentLoop = new Date().getMilliseconds()
    if (lastLoop > currentLoop) {
      fps = count
      count = 1
    } else {
      count += 1
    }
    lastLoop = currentLoop
    return fps
  }
})()

Debug.prototype.update = function() {
  const newFPS = this.calcFPS()
  const worldRef = this.getWorld()
  const playerPos = this.getPlayer().getCoordinates()

  if (!this.getMaxFPS() || this.getMaxFPS() < newFPS) this.setMaxFPS(newFPS)
  if (!this.getMinFPS() || this.getMinFPS() > newFPS) this.setMinFPS(newFPS)

  // prettier-ignore
  this.getDOM_coordinates().innerHTML = `XYZ: ${Helpers.round(playerPos.x, 2)} /
                                ${Helpers.round(playerPos.y, 2)} /
                                ${Helpers.round(playerPos.z, 2)}`

  this.getDOM_FPS().innerHTML = `${newFPS} fps [${this.getMinFPS() || 0} - ${this.getMaxFPS() ||
    0}]`

  const targetedTag = BlockDict[worldRef.getTargetBlockType()]
  if (targetedTag) this.getDOM_targetedBlock().innerHTML = targetedTag.tag

  const worldDays = worldRef.getDays()
  if (worldDays !== this.getDaysVal()) {
    this.setDaysVal(worldDays)
    this.getDOM_days().innerHTML = `Day ${worldDays}`
  }
}

Debug.prototype.toggle = function() {
  const display = this.getDisplay()
  const wrapper = this.getDOM_wrapper()

  if (display) {
    this.setDisplay(false)
    wrapper.style.display = 'none'
  } else {
    this.setDisplay(true)
    wrapper.style.display = 'flex'
  }
}

export default Debug
