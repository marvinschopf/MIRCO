'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const parse = require('../parse-message')
const debug = require('debug')('eyearesee:views:input')
const utils = require('../utils')
const argsplit = require('argsplit')

const MAX_HISTORY_SIZE = 30

module.exports = Input

function Input(target) {
  if (!(this instanceof Input))
    return new Input(target)

  this.history = []
  this.historyIndex = -1
  this.line = ''
  this.isTabbing = false
  this._tabChar = ''
  this._tabOrig = ''
  Base.call(this, target)
}
inherits(Input, Base)

Input.prototype.addLine = function addLine(line) {
  debug('addLine %s', line)
  if (!line) return ''
  if (this.history.length === 0 || this.history[0] !== line) {
    this.history.unshift(line)

    if (this.history.length > MAX_HISTORY_SIZE)
      this.history.pop()
  }

  this.historyIndex = -1
  return this.line = this.history[0]
}

Input.prototype._historyNext = function _historyNext(node) {
  if (this.historyIndex > 0) {
    this.historyIndex--
    this.line = this.history[this.historyIndex]
    node.value = this.line
  } else if (this.historyIndex === 0) {
    this.historyIndex = -1
    this.line = ''
    node.value = this.line
  }
}

Input.prototype._historyPrev = function _historyPrev(node) {
  if (this.historyIndex + 1 < this.history.length) {
    this.historyIndex++
    this.line = this.history[this.historyIndex]
    node.value = this.line
  }
}

Input.prototype.keypressed = function keypressed(e, nav) {
  const node = e.target || e.srcElement

  // reset tabbing
  if (e.keyCode !== 9 && this.isTabbing) {
    this.isTabbing = false
    this._tabChar = ''
    this._tabOrig = ''
  }

  // enter
  if (e.keyCode === 13 && node && node.type === 'text') {
    const val = node.value
    if (!val) return
    const msg = parse(val)
    this.addLine(val)
    node.value = ''
    this.send('command', msg)
  } else if (e.keyCode === 38 || e.keyCode === 40) {
    e.preventDefault()
    // left arrow
    if (e.keyCode === 38) {
      debug('prev')
      this._historyPrev(node)
    // right arrow
    } else {
      debug('next')
      this._historyNext(node)
    }
  // tab only for channels
  } else if (e.keyCode === 9) {
    if (!node.value) return
    if (nav.current.type === 'channel' || nav.current.type === 'private') {
      e.preventDefault()
      const value = argsplit(node.value)
      let val = value[value.length - 1]
      if (!val) return
      if (this._tabOrig) {
        value[value.length - 1] = this._tabOrig
      } else {
        this._tabOrig = val
      }

      const com = this._tabOrig
      debug('getting completions for %s', this._tabOrig)
      const names = utils.namesMatching(this._tabOrig, nav.current._onlyNames)

      if (!names.length) return

      if (this.isTabbing) {
        // go to the next item in the list
        let idx = names.indexOf(val)
        if (idx > -1) {
          // found a match
          // go to the next one if it exists
          if (idx < names.length - 1) {
            idx++
          } else {
            // at the end
            // grab the first
            idx = 0
          }
          value[value.length - 1] = names[idx]
          this._tabChar = val
          node.value = value.join(' ')
        } else {
          // couldn't find anything
          debug('no matches found')
          return
        }
      } else {
        this.isTabbing = true
        this._tabChar = val
        this._tabOrig = val
        value[value.length - 1] = names[0]
        node.value = value.join(' ')
      }
    }
  }
}

Input.prototype.render = function render(nav) {
  return [
    h('#inputContainer', [
      h('#footer', [
        h('input.inputMessage', {
          id: 'inputMessage'
        , type: 'text'
        , placeholder: 'Send message...'
        , onkeydown: (e) => {
            this.keypressed(e, nav)
          }
        })
      ])
    ])
  ]
}