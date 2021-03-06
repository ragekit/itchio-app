import test from 'zopf'
import proxyquire from 'proxyquire'
import Immutable from 'seamless-immutable'

import electron from '../stubs/electron'
import http from '../stubs/http'
import InstallStore from '../stubs/install-store'
import CredentialsStore from '../stubs/credentials-store'

let typical_install = Immutable({
  _id: 42,
  upload_id: 11,
  uploads: { '11': { id: 11, size: 512 } }
})

let upload_response = Immutable({
  url: 'http://example.org/game.zip'
})

let setup = (t) => {
  let fs = {
    lstatAsync: () => null
  }
  let client = CredentialsStore.get_current_user()

  let stubs = Object.assign({
    '../stores/install-store': InstallStore,
    '../stores/credentials-store': CredentialsStore,
    '../util/http': http,
    '../promised/fs': fs
  }, electron)

  let download = proxyquire('../../app/tasks/download', stubs)
  return {download, client, fs, http}
}

test('download', t => {
  let {download, client, fs, http} = setup(t)

  t.case('validates upload_id', t => {
    let install = typical_install.merge({upload_id: 22})
    t.stub(InstallStore, 'get_install').resolves(install)
    return t.rejects(download.start({id: 42}))
  })

  t.case('validates upload in list', t => {
    return t.rejects(download.start({id: 42}))
  })

  t.case('downloads free game', t => {
    let install = typical_install
    t.stub(InstallStore, 'get_install').resolves(install)
    t.stub(client, 'download_upload').resolves(upload_response)
    t.stub(fs, 'lstatAsync').rejects()
    return download.start({id: 42})
  })

  t.case('downloads paid game', t => {
    let install = typical_install.merge({key: {id: 'abacus'}})
    t.stub(InstallStore, 'get_install').resolves(install)
    t.stub(client, 'download_upload_with_key').resolves(upload_response)
    t.stub(fs, 'lstatAsync').rejects()
    return download.start({id: 42})
  })

  t.case('skips when complete', t => {
    t.stub(InstallStore, 'get_install').resolves(typical_install)
    t.stub(client, 'download_upload').resolves(upload_response)
    t.stub(fs, 'lstatAsync').resolves({size: 512})
    return t.rejects(download.start({id: 42}))
  })

  t.case('resumes', t => {
    t.stub(InstallStore, 'get_install').resolves(typical_install)
    t.stub(client, 'download_upload').resolves(upload_response)
    t.stub(fs, 'lstatAsync').resolves({size: 256})
    let mock = t.mock(http)
    mock.expects('request').calledWith({})
    return download.start({id: 42})
  })
})
