'use strict'

const h = require('virtual-dom/h')
const inherits = require('util').inherits
const Base = require('vdelement')
const debug = require('debug')('eyearesee:views:settings')

module.exports = Settings

function Settings(target) {
  if (!(this instanceof Settings))
    return new Settings(target)

  Base.call(this, target)
}
inherits(Settings, Base)

Settings.prototype.close = function close(e) {
  e.preventDefault()
  this.target.showConnection()
}

Settings.prototype.onChange = function onChange(e) {
  debug('changed to %s', e.target.value)
  this.target.themes.activate(e.target.value)
}

Settings.prototype.render = function render() {
  const settings = this.target.settings
  const themes = new Array(this.target.themes.themes.size)
  let i = 0
  for (const item of this.target.themes.themes.values()) {
    themes[i++] = h('option', {
      selected: item.active
    }, item.name)
  }

  return h('irc-settings.settings-container', [
    h('a.close', {
      innerHTML: '&times;'
    , onclick: (e) => {
        this.close(e)
      }
    })
  , h('.form.form-dark.col-sm-12', [
      h('.clearfix')
    , h('form.form-horizontal', [
        h('.form-group', [
          h('label.control-label.col-sm-3', {
            attributes: {
              for: 'theme'
            }
          }, 'Theme')
        , h('.col-sm-5', [
            h('select.form-control', {
              onchange: (e) => {
                this.onChange(e)
              }
            }, themes)
          ])
        , h('.col-sm-4')
        ])
      ])
    ])
  ])
}