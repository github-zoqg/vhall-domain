const semver = require('semver')

const log = console.log

log(semver.valid('1.2.3'))
log(semver.valid('aaa1.2.3'))
log(semver.valid('444--1.2.3aaff'))

log(semver.lt('1.2.3', '9.8.7'))
log(semver.gt('1.2.3', '9.8.7'))

log(semver.major('1.2.3'))
log(semver.minor('1.2.3'))
log(semver.patch('1.2.3'))

log(semver.inc('1.2.99', 'major'))
log(semver.inc('1.2.99', 'minor'))
log(semver.inc('1.2.99', 'patch'))