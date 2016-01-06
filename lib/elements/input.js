'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('./base-element')
const parse = require('../parse-message')

module.exports = Input

function Input(target) {
  Base.call(this, target)
}
inherits(Input, Base)

Input.prototype.keypressed = function keypressed(e) {
  const node = e.target || e.srcElement
  if (e.keyCode === 13 && node && node.type === 'text') {
    const val = node.value
    const msg = parse(val)

    console.log('message', msg)
    node.value = ''
    this.send('command', msg)
  }
}

Input.prototype.render = function render() {
  return [
    h('#inputContainer', [
      h('#footer', [
        h('input.inputMessage', {
          id: 'inputMessage'
        , type: 'text'
        , placeholder: 'Send message...'
        , onkeypress: (e) => {
            this.keypressed(e)
          }
        })
      ])
    ])
  ]
}