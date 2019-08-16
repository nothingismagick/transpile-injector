const { transpileInjector } = require('../')
const path = require('path')

const input = path.join('./test/fixtures/normalExport.js')
const output = path.join('./test/tmp/normalExport.js')
const injection = {
  object: {
    one: 2,
    two: 'two',
    three: '"three"'
  },
  array: [
    'thong',
    'thing',
    'thung'
  ]
}
const opts = {
  log: false,
  strict: true
}
transpileInjector(input, output, injection, opts).then(msg => {
  if (!msg.exitCode === 0) {
    console.log(msg.errMsg)
  } else {
    console.log(msg.exitCode)
    console.log(msg.errMsg)
  }
})
