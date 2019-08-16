const { readFileSync, writeFileSync, ensureFileSync } = require('fs-extra')
const prettier = require("prettier")
const acorn = require("acorn")
const walk = require("acorn-walk")
const escodegen = require("escodegen")
// const { parse, print } = require("recast")
const recast = require("recast")

/**
 *
 * @type {namedTypes}
 */
const n = recast.types.namedTypes

/**
 *
 * @type {{errMsg: string, exitCode: number}}
 */
let exit = { exitCode: 0, errMsg: 'Success' }
let source

/**
 *
 * @param {number} code
 * @param {string} msg
 * @param {boolean} strict
 * @returns {{errMsg: number, exitCode: *}}
 * @private
 */
const _createExit = function (code, msg, strict) {
  if (strict) {
    console.log(msg)
    process.exit(1)
  }
  return exit = {
    exitCode: code,
    errMsg: msg
  }
}

/**
 *
 * @param {*} injection
 * @returns {{errMsg: number, exitCode: *}}
 * @private
 */
const _detect = function (injection) {
  // be robust about the injection and the inFile source
  if (typeof injection !== 'object' && typeof injection !== 'string') {
    return _createExit(1,'[transpileInjector]: Injection not object or string.', opts.strict)
  } else {
    try {
      source = readFileSync(inFile, 'utf8')
    } catch (err) {
      return _createExit(1, err, opts.strict)
    }
  }
}

/**
 * @name transpileInjector
 *
 * @description This async function ingests a file, accepts an object to
 * inject into the file, updates the AST and writes to the target file.
 *
 * @example
 *
 *    // thenable
 *    transpileInjector({
 *      strategy: 'merge',
 *      baseType: 'ReturnStatement',
 *      strict: false
 *    },
 *    infile,
 *    outfile
 *    injection).then(msg => {
 *      if (!msg.exitCode === 0) {
 *        // didn't work
 *      }
 *    })
 *
 *    // async
 *    const exit = await transpileInjector(opts, inpath, outpath, injection)
 *
 * @param {string} inFile - original file /**
 * @name transpileInjector
 *
 * @description This async function ingests a file, accepts an object to
 * inject into the file, updates the AST and writes to the target file.
 *
 * @example
 *
 *    // thenable
 *    transpileInjector({
 *      strategy: 'merge',
 *      baseType: 'ReturnStatement',
 *      strict: false
 *    },
 *    {thing: 'thang'}).then(msg => {
 *      if (!msg.exitCode === 0) {
 *        // didn't work
 *      }
 *    './test.js',
 *    './test.js' // overwrite existing file is default behavior if not declared
 *    })
 *
 *    // async
 *    const exit = await transpileInjector(opts, injection, inpath, outpath)
 *
 *
 * @param {Object} opts
 * @param {string} opts.strategy - [merge|skip]
 * @param {string} opts.baseType - ensure node type
 * @param {object} opts.prettierConfig - override the prettier config
 * @param {object} opts.astGenerator - override the generator default
 * @param {boolean} opts.strict - process.exit(1) on any error
 * @param {(object|string)} injection - object to inject
 * @param {string} inFile - original filepath prepared for OS
 * @param {string} outFile - target filepath prepared for OS [optional]
 * @returns {Promise<{errMsg: *, exitCode: number}>}
 */
exports.transpileInjector = async (inFile, outFile, injection, opts) => {

  // safeguard opts
  opts = typeof opts !== 'undefined' ? opts : {}

  // guard for injection type compliance
  _detect(injection)

  // set default prettier Config
  if (!opts.prettierConfig) {
    opts.prettierConfig = {
      editorConfig: true,
      parser: 'babel',
      singleQuote: true,
      semi: false,
      endOfLine: 'auto',
      printWidth: 40,
      trailingComma: 'none'
    }
  }
  if (!opts.astGenerator) {
    opts.astGenerator = {
      format: {
        indent: {
          style: '  ',
          base: 0,
          adjustMultilineComment: false
        },
        newline: '\n',
        space: ' ',
        json: false,
        renumber: false,
        hexadecimal: false,
        quotes: 'single',
        escapeless: false,
        compact: false,
        parentheses: true,
        semicolons: false,
        safeConcatenation: false
      },
      moz: {
        starlessGenerator: false,
        parenthesizedComprehensionBlock: false,
        comprehensionExpressionStartsWithAssignment: false
      },
      parse: null,
      comment: false,
      sourceMap: undefined,
      sourceMapRoot: null,
      sourceMapWithCode: false,
      file: undefined,
      directive: false,
      verbatim: undefined
    }
  }


  // generate the ast from the inFile
  const ast = recast.parse(source, {
    sourceType: 'module' // detect what we need
  })

  const add = ast.program.body[0]


  // n.FunctionDeclaration.assert(add)
  // n.ArrayExpression.assert(add)
  // n.ObjectExpression.assert(add)

  console.log(n)


  process.exit(0)

  walk.simple(ast, {
    Expression: (node) => {
      Object.keys(injection).forEach(key => {
        if (typeof injection[key] === 'object') {
            Object.keys(injection[key]).forEach(key2 => {

              getChildren(node,injection[key][key2])

              // walk.findNodeAfter(node).value = injection[key][key2]

              /// if (t.isIdentifier(node, {name: key2})) {
              ///  path.getSibling(path.key + 1).container.value.value = injection[key][key2]
              /// }
            })
          } /* else if (typeof injection[key] === 'string') {
            if (t.isIdentifier(path.node, {name: key})) {
              path.getSibling(path.key + 1).container.value.value = injection[key]
            }
          } */
        })
      console.log(node)
      if (node.value === 'array') node.value = ['things']
    }
  })
  /*
  let lock = false
  // walk the AST exactly once and do stuff
  traverse(ast, {
    enter(path) {
      // if (path.findParent((path) => path.node.type === opts.baseType)) {
        Object.keys(injection).forEach(key => {
          // If it's an array, the current pattern defers to overwriting the entire array
          if (Object.prototype.toString.call( injection[key] ) === '[object Array]') {
            // if (injection[key].constructor.name == "Array") {
            // console.log(injection[key])
            let lock = ''
              console.log('match => ', path.key.name, key)
              // if (path.findParent((path) => path.node.type === "ArrayExpression")) {
              if (path.node.type === "ArrayExpression" && path.container.key.name === key && lock !== key) {
                console.log(path.container.key.name)
                console.log('\n\n\n\n\n\n')
                this.injection = parseExpression(JSON.stringify(injection[key]))
                console.log(this.injection)
                path.replaceWithMultiple(t.arrayExpression(this.injection.elements))
                // path.replaceWithMultiple([this.injection.elements])
                lock = key
              }
              if (path.findParent((path) => path.node.type === "ArrayExpression")) {
              // create the AST from tht
              // process.exit(0)

              /*
              // Injector for same length array
              if (path.getSibling(path.key).container.length === injection[key].length) {
                for (let i = 0; i < injection[key].length; i++) {
                  path.getSibling(path.key).container[i].value = injection[key][i]
                }
              } else if (lock === false) {
                this.injection = parseExpression(JSON.stringify(injection[key]))
                console.log('AE')
                console.log(key, injection[key].length)
                console.log('AST', path.getSibling(path.key).container.length)
                console.log(this.injection.elements)
                console.log('---------')
                console.log(path.container) // = this.injection.elements
                path.replaceWithMultiple(this.injection.elements)
                lock = true
                // process.exit(0)
              }
              /*
              // Injector for shorter injections
              if (path.getSibling(path.key).container.length > injection[key].length) {
                for (let i = 0; i < injection[key].length; i++) {
                  console.log('shorter')
                  // path.getSibling(path.key).container[i].value = injection[key][i]
                  // if
                }
              }

              // Injector for longer arrays
              if (path.getSibling(path.key).container.length < injection[key].length) {
                for (let i = 0; i < injection[key].length; i++) {
                  console.log('longer')
                  if (i > path.getSibling(path.key).container.length) {
                    let obj = path.getSibling(path.key).container[0]
                    path.insertAfter(obj)
                  }
                  path.getSibling(path.key).container[i].value = injection[key][i]
                  console.log('inserted')
                }
              }

              // for (let i = 0; i < injection[key].length; i++) {
              //   path.getSibling(path.key).container[i].value = injection[key][i]
              //   console.log('key', injection[key][i])
                // path.getChildren(path.key + i).value=injection[key][i]
                ///// path.insertAfter(path.key + 1).value = injection[key][i]
                // path.getSibling(path.key + 1).replaceWithSourceString(injection[key][i])
              // }
                 // path.insertAfter(injection[key][key2])
                 // path.getSibling(path.key).replaceWithSourceString(injection[key])
                 // console.log(injection[key])
                // }
             // })
            }
          }
          else if (typeof injection[key] === 'object') {
            Object.keys(injection[key]).forEach(key2 => {
              if (t.isIdentifier(path.node, {name: key2})) {
                path.getSibling(path.key + 1).container.value.value = injection[key][key2]
              }
            })
          } else if (typeof injection[key] === 'string') {
            if (t.isIdentifier(path.node, {name: key})) {
              path.getSibling(path.key + 1).container.value.value = injection[key]
            }
          }
        })
      }
    // }
  })
*/
  // recreate code from AST
  const generated = escodegen.generate(ast, opts.astGenerator)

  // guarantee the outFile exists
  ensureFileSync(outFile)

  // prettify and write to FS
  writeFileSync(outFile, generated, 'utf8')
  // writeFileSync(outFile, prettier.format(generated.code, opts.prettierConfig), 'utf8')

  return exit
}
