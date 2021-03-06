
var fs = require('fs')
var path = require('path')
var license_path = path.join(__dirname, 'LICENSE')
var license = fs.readFileSync(license_path, { encoding: 'utf8' })
var package_path = path.join(__dirname, 'package.json')
var version = JSON.parse(fs.readFileSync(package_path, { encoding: 'utf8' })).version
var ico_path = 'app/static/images/itchio.ico'
var icns_path = 'app/static/images/itchio.icns'
var electron_version = '0.33.7'
var out_dir = path.join('build', version)
var company_name = 'Itch Corp'

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt)

  grunt.initConfig({
    // Compile SCSS files to CSS
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'app/style/main.css': 'app/style/main.scss'
        }
      }
    },
    // Compile ES6 files to ES5
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.',
          src: ['app/**/*.es6', 'test/**/*.es6'],
          dest: '.',
          ext: '.js'
        }]
      }
    },
    // Recompile files on-demand
    watch: {
      es6: {
        files: ['app/**/*.es6', 'test/**/*.es6'],
        tasks: ['newer:babel'],
        options: {
          debounceDelay: 20
        }
      },
      scss: {
        files: ['app/**/*.scss'],
        tasks: ['sass'],
        options: {
          debounceDelay: 20
        }
      }
    },
    // Create a .exe, .app, folder for windows, mac, linux
    electron: {
      win32: {
        options: {
          dir: '.',
          name: 'itch.io',
          platform: 'win32',
          arch: 'ia32',
          version: electron_version,
          out: out_dir,
          icon: ico_path,
          asar: true,
          'app-version': version,
          'version-string': {
            CompanyName: company_name,
            LegalCopyright: license,
            FileDescription: 'itch.io desktop client',
            OriginalFileName: 'itch.io.exe',
            FileVersion: version,
            AppVersion: version,
            ProductName: 'itch.io',
            InternalName: 'itch.io.exe'
          }
        }
      },
      darwin: {
        options: {
          dir: '.',
          name: 'itch.io',
          platform: 'darwin',
          arch: 'x64',
          version: electron_version,
          out: out_dir,
          icon: icns_path,
          asar: true,
          'app-version': version
        }
      },
      linux: {
        options: {
          dir: '.',
          name: 'itch.io',
          platform: 'linux',
          arch: 'all',
          version: electron_version,
          out: out_dir,
          asar: true,
          'app-version': version
        }
      }
    },
    'create-windows-installer': {
      ia32: {
        appDirectory: path.join(out_dir, 'itch.io-win32-ia32'),
        outputDirectory: path.join('build', 'itch.io-win32-installer'),
        authors: company_name,
        exe: 'itch.io.exe',
        description: 'itch.io desktop app',
        version: version,
        title: 'itch.io',
        iconUrl: 'http://raw.githubusercontent.com/itchio/itchio-app/master/app/static/images/itchio.ico',
        setupIcon: ico_path,
        remoteReleases: 'https://github.com/itchio/itchio-app',
        certificateFile: '../itchio-app-secrets/certificate.cer'
      }
    }
  })

  grunt.registerTask('all', ['sass', 'babel'])
  grunt.registerTask('default', ['newer:sass', 'newer:babel'])
}
