const { transpileInjector } = require('../')
const path = require('path')

const infile = path.join('./test/fixtures/normalExport.js')
const outfile = path.join('./test/tmp/normalExport.js')
const injection = {
  object: {
    one: 1,
    two: 'two',
    three: '"three"'
  },
  string: 'string',
  array: ['thing', 'thang', 'thung']
}
const options = {
  strategy: 'merge',
  baseType: 'ReturnStatement',
  strict: false
}

transpileInjector(infile, outfile, injection, options).then(msg => {
  if (!msg.exitCode === 0) {
    console.log(msg.errMsg)
  } else {
    console.log(msg.exitCode)
    console.log(msg.errMsg)
  }
})
