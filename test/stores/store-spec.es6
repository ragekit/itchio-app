import test from 'zopf'
import sinon from 'sinon'

import Store from '../../app/stores/store'

test('Store', t => {
  t.case('event listeners', t => {
    let store = new Store()
    let spy = t.spy()
    store.add_change_listener('green', spy)
    store.emit_change()
    store.remove_change_listener('green')
    t.is(1, spy.callCount)
    store.remove_change_listener('green')
  })

  t.case('action listeners', t => {
    t.throws(() => Store.action_listeners(on => on(undefined, () => {})))

    let wake_spy = t.spy()
    let sleep_spy = t.spy()
    let cb = Store.action_listeners(on => {
      on('wake', wake_spy)
      on('sleep', sleep_spy)
    })
    let wake = {action_type: 'wake'}
    cb(wake)
    sinon.assert.calledWith(wake_spy, wake)
    let sleep = {action_type: 'sleep'}
    cb(sleep)
    sinon.assert.calledWith(sleep_spy, sleep)
  })
})
