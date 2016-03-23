
# Continuous deployment

itch is continuously being built, tested, and deployed, to help us
keep it high-quality and low on bugs.

To do so, we run our own instance of [Gitlab CI][]:

  * <https://git.itch.ovh>

[Gitlab CI]: http://doc.gitlab.com/ce/ci/

## Git mirroring

Since the main repository for itch is [on Github][github repo], and since Gitlab CI
will only build projects that are hosted on a Gitlab instance, itch and associated
projects have pages on our gitlab instance:

  * <https://git.itch.ovh/itchio/itch>

[github repo]: https://github.com/itchio/itch

Developers don't have to worry about the Gitlab project page: they should clone
the repository from the Github remote and push to it, as usual. The github project
has a webhook that POSTs a signed payload to a custom service, `git-mirror`, which
fetches from Github and pushes to Gitlab on-demand:

  * <https://github.com/fasterthanlime/git-mirror>

### Known issues with git mirroring

Force-pushing a tag (to re-build a version that isn't published yet) doesn't seem
to result in `git-mirror` getting pinged, and for now, Amos has to manually
ssh into the server and run the `git pull / push` commands.

This happens rarely enough for Amos not to be looking hard for a solution right now
but if anyone reading this knows why this happens, he's [all ears][@ftl]

[@ftl]: https://twitter.com/fasterthanlime

## Build scripts

Gitlab CI has a simple YAML configuration file, similar to Travis CI.
Its format is detailed in the [Gitlab CI] documentation, and can be
validated using the [CI lint][] page.

itch's [CI config][] is relatively straight-forward, most of the complexity lives
in individual shell scripts in the `release/` directory.

[CI lint]: https://git.itch.ovh/ci/lint
[CI config]: https://github.com/itchio/itch/blob/master/.gitlab-ci.yml

### Book generation

The book you're reading right now is compiled from Markdown to HTML using [gitbook][] on every commit.

It is then uploaded to `https://docs.itch.ovh/itch/REF`, where `REF` is either
a branch, like `master`, or a tag, like `v0.14.0-canary`.

[gitbook]: https://www.npmjs.com/package/gitbook

As a result, the bleeding-edge version of this book is always available at:

  * <https://docs.itch.ovh/itch/master>

### Unit tests & linting

The codebase is covered by a certain amount of unit tests, in `testsrc/`.

On every commit, the CI executes all unit tests, and runs the `standard`
command-line tool to make sure all our code conforms to [JavaScript standard style][].

[JavaScript standard style]: http://standardjs.com/

### Building

The building scripts run some common steps on every platform:

  * Compiling [ES2015][] code down to ES6 (see [Coding Style](./coding-style.md) for more details)
  * Compiling [SASS][] code down to CSS
  * Copying some asset files (vendor CSS/JS/images)

[ES2015]: http://babeljs.io/
[SASS]: http://sass-lang.com/

### Packaging

#### Windows

.exe + resources is built with [grunt-electron][], then [grunt-electron-installer][] generates `-full.nupkg`, `-delta.nupkg`, and
`RELEASES`, needed for Squirrel.Windows update.

[grunt-electron]: https://github.com/sindresorhus/grunt-electron
[grunt-electron-installer]: https://github.com/electron/grunt-electron-installer

#### OSX

.zip is built with `7za` (7-zip command-line), .dmg is built with [node-appdmg][],
with a custom background made in GIMP.

[node-appdmg]: https://www.npmjs.com/package/appdmg

#### Linux

The .desktop file is generated via `release/X.desktop.in` files + `sed`. All
locale files are parsed for translations of the app's name and description.

deb & rpm packages are generated thanks to [fpm][], and uploaded to Bintray
with [dpl][].

[fpm]: https://github.com/jordansissel/fpm
[dpl]: https://rubygems.org/gems/dpl

### Uploading to GitHub releases

All artifacts are uploaded to the relevant GitHub release pages:

  * https://github.com/itchio/itch/releases
  * https://github.com/itchio/itch_canary/releases

...using our fork of [github-release][], a golang uploader.

*Our fork adds the `-R` command-line option, which replaces an asset if it
already exists, and is necessary to retry failed uploads to GitHub (which
used to happen a lot).*

[github-release]: https://github.com/itchio/github-release

## The canary channel

When making large structural changes, it is sometimes useful to have a completely
separate version of the app with no expectations of stability.

`itch_canary` is exactly that. It is meant to be installed in parallel of the stable
app, and has a distinct branding (color-swapped pink to blue), uses different folders
(`%APPDATA%/itch_canary`, `~/.config/itch_canary`, `~/Library/Application Support/itch_canary`).