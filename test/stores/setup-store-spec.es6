import test from 'zopf'
import proxyquire from 'proxyquire'

import AppConstants from '../../app/constants/app-constants'

import electron from '../stubs/electron'
import AppDispatcher from '../stubs/app-dispatcher'

let setup = t => {
  let os = {
    check_presence: () => Promise.resolve(),
    platform: () => 'win32'
  }
  let http = {
    request: () => null
  }
  let stubs = Object.assign({
    '../util/os': os,
    '../util/http': http,
    '../dispatcher/app-dispatcher': AppDispatcher
  }, electron)

  let SetupStore = proxyquire('../../app/stores/setup-store', stubs)
  let handler = AppDispatcher.get_handler(SetupStore)
  return {handler, os, http}
}

test('SetupStore', t => {
  let {handler, os, http} = setup(t)

  t.case('boot (good)', t => {
    t.stub(os, 'check_presence').resolves()
    return handler({ action_type: AppConstants.BOOT })
  })

  t.case('boot (win32, no 7za)', t => {
    t.stub(os, 'check_presence').rejects()
    t.mock(http).expects('request').once().resolves()
    return handler({ action_type: AppConstants.BOOT })
  })

  t.case('boot (darwin, no 7za)', t => {
    t.stub(os, 'check_presence').rejects()
    t.stub(os, 'platform').returns('darwin')
    t.mock(http).expects('request').once().resolves()
    return handler({ action_type: AppConstants.BOOT })
  })

  t.case('boot (linux, no 7za)', t => {
    t.stub(os, 'check_presence').rejects()
    t.stub(os, 'platform').returns('linux')
    return t.rejects(handler({ action_type: AppConstants.BOOT }))
  })
})
