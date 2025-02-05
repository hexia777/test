export default class Disable {
  constructor(step) {
    this.step = step
  }
  render(target) {
    this.step.operate.disabled = true
    this.step.operate.destory(true)
    target.event._removeHover()
    target.event._removeSelect()
    if (target.actionCallback.onUnselect) {
      target.actionCallback.onUnselect()
    }
  }
}
