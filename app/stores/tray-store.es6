import AppDispatcher from '../dispatcher/app-dispatcher'
import AppConstants from '../constants/app-constants'
import AppActions from '../actions/app-actions'
import Store from './store'

import path from 'path'

import app from 'app'
import Menu from 'menu'
import Tray from 'tray'

import os from '../util/os'

let tray

let TrayStore = Object.assign(new Store(), {
  with: (cb) => {
    if (!tray) return
    cb(tray)
  }
})

function make_tray () {
  let icon_path = `${__dirname}/../static/images/itchio-tray-small.png`
  tray = new Tray(path.resolve(icon_path))
  tray.setToolTip('itch.io')
  tray.on('clicked', () => AppActions.focus_window())
  tray.on('double-clicked', () => AppActions.focus_window())
  TrayStore.emit_change()
}

function set_menu (tray_menu) {
  if (os.platform() === 'darwin') {
    app.dock.setMenu(tray_menu)
  } else {
    if (!tray) make_tray()
    tray.setContextMenu(tray_menu)
    TrayStore.emit_change()
  }
}

function refresh () {
  let menu_template = [
    { label: 'Owned', click: () => AppActions.focus_panel('owned') },
    { label: 'Dashboard', click: () => AppActions.focus_panel('dashboard') }
  ]

  if (os.platform() !== 'darwin') {
    menu_template = menu_template.concat([
      { type: 'separator' },
      { label: 'Exit', click: () => AppActions.quit() }
    ])
  }

  let tray_menu = Menu.buildFromTemplate(menu_template)
  set_menu(tray_menu)
  TrayStore.emit_change()
}

TrayStore.dispatch_token = AppDispatcher.register(Store.action_listeners(on => {
  on(AppConstants.BOOT, refresh)
}))

export default TrayStore
