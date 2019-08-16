const { readFileSync, writeFileSync, ensureFileSync } = require('fs-extra')
const prettier = require("prettier")
const recast = require("recast")

/**
 *
 * @type {{result: {}, msg: string, exitCode: number}}
 */
let exit = { result: {}, msg: 'Success', exitCode: 0}

/**
 * @description Frozen default options
 * @type {Readonly<{log: boolean, prettierConfig: {editorConfig: boolean, parser: string, endOfLine: string, singleQuote: boolean, printWidth: number, trailingComma: string, semi: boolean}, strategy: string, strict: boolean, resultType: string, astGenerator: {sourceMapRoot: null, file: *, sourceMap: *, format: {safeConcatenation: boolean, parentheses: boolean, newline: string, escapeless: boolean, compact: boolean, indent: {style: string, adjustMultilineComment: boolean, base: number}, renumber: boolean, semicolons: boolean, json: boolean, space: string, hexadecimal: boolean, quotes: string}, moz: {comprehensionExpressionStartsWithAssignment: boolean, starlessGenerator: boolean, parenthesizedComprehensionBlock: boolean}, comment: boolean, parse: null, sourceMapWithCode: boolean, verbatim: *, directive: boolean}, baseType: string, prettier: boolean}>}
 */
const defaultOptions = Object.freeze({
  strategy: 'merge',
  baseType: 'ReturnStatement',
  resultType: 'file',
  prettier: false,
  prettierConfig: {
    editorConfig: true,
    parser: 'babel',
    singleQuote: true,
    semi: false,
    endOfLine: 'auto',
    printWidth: 40,
    trailingComma: 'none'
  },
  astGenerator: {
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
  },
  strict: false,
  log: false
})

/**
 * @description This async function ingests a file, accepts an object to
 * inject into the file, updates the AST and writes to the target file.
 *
 * @example
 *
 *    // thenable
 *    transpileInjector({
 *      strategy: 'merge',
 *      strict: false,
 *      log: true
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
 *    const exit = await transpileInjector(input, output, injection, opts)
 *
 * @param {string|object} input - filepath or object for AST transpilation
 * @param {string} output - target filepath prepared for OS
 * @param {(object|string)} injection - object or string to inject
 * @param {object} opts
 * @param {string} opts.strategy - [merge|skip]
 * @param {string} opts.baseType - ensure node type
 * @param {string} opts.resultType - ['object'|'file']
 * @param {boolean} opts.prettier - use prettier for AST cleanup
 * @param {object} opts.prettierConfig - override the prettier config
 * @param {object} opts.astGenerator - override the generator default
 * @param {boolean} opts.ignoreDefaults - do not merge options with defaults
 * @param {boolean} opts.strict - process.exit(1) on any error
 * @param {boolean} opts.log - reveal logs
 * @returns {Promise<{result: {}, msg: string, exitCode: number}>} */
exports.transpileInjector = async (input, output, injection, opts) => {

  /**
   * @description Create the exit object
   *
   * @type {function}
   * @param {*} code
   * @param {*} msg
   * @param {string|null} rawError
   * @returns {{msg: number, exitCode: *, result: {}}}
   * @private
   */
  const _createExit = function (code, msg, rawError = null) {
    if (opts.strict === true) { // exit process throw
      console.log(`
 ${msg}
    `)
      if(opts.log) {
        console.log(`
 ${rawError}
    `)
      }
      process.exit(1)
    }
    exit = {
      exitCode: code,
      msg: msg,
      result: {
        rawError: rawError
      }
    }
  }

  /**
   * @description Validate injection, import src and prepare outputs
   * @type {Function}
   * @returns {{msg: Number, exitCode: *}|*}
   * @private
   */
  const _sinkGuard = function () {
    // be robust about the injection and the input source
    if (typeof injection !== 'object' && typeof injection !== 'string') {
      return _createExit(1,
        '[transpileInjector]: Error. Injection parameter is not object or string.',
        'Type Error')
    } else {
      if (typeof input === 'string') { // a file
        try {
          return readFileSync(input, 'utf8')
        } catch (err) {
          return _createExit(1,
            '[transpileInjector]: Error. Cannot read input string as a file.',
            err)
        }
      } else if (typeof input === 'object') {
        return JSON.parse(Object(input))
      } else {
        return _createExit(1,
          '[transpileInjector]: Error. Input is not a string or an object.',
          'Type Error')
      }
    }
  }

  /**
   * @description Validate the options, merge with defaults and freeze
   * @returns {*}
   * @private
   */
  const _optsValidator = function () {
    if (opts && typeof opts !== 'object') {
      this.strict = { strict: true }
      opts = { ...defaultOptions, ...this.strict }
      return _createExit(1,
        '[transpileInjector]: Error. Opts not in object form.',
        'Type Error')
    } else {
      return opts === Object(opts) && opts.ignoreDefaults === true
        ? { opts }
        : { ...defaultOptions, ...opts}
    }
  }

  /**
   *
   * @param {string} generated
   * @returns {{result: {generated: *}, msg: string, exitCode: number}|*}
   * @private
   */
  const _emitter = function (generated) {
    // use prettier if told to
    if (opts.prettier === true) {
      // todo: make sure this still works
      generated = prettier.format(generated.code, opts.prettierConfig)
    }
    if (opts.resultType === 'file') {
      // prettify and write to FS
      try {
        ensureFileSync(output)
        writeFileSync(output, generated, 'utf8')
      } catch (err) {
        return _createExit(1,
          ' [transpileInjector]: Error. Could not write to file.',
          err
        )
      }

    } else {
      // else just return this exit code
      return {
        ...exit,
        result: {generated: generated},
        exitCode: 0,
        msg: 'Success'
      }
    }
  }


  // //////////////////////////////////////////// Main Process

  // Validate, merge and freeze opts
  opts = _optsValidator()

  // Guard Imports
  const source = _sinkGuard()
  if (opts.log) {
    console.log(opts)
    console.log('src: ', source)
  }
  // process.exit(0)
  // Generate the ast from the inFile
  let ast = recast.parse(source)
  ////  console.log(ast.program.body[0].expression.right.body)

  /*const acornAst = recast.parse(source, {
    parser: {
      parse(source) {
        return require("acorn").parse(source, {
          // additional options
        });
      }
    }
  });
  */

  // process.exit(0)
  Object.keys(injection).forEach(key => {
    if (typeof injection[key] === 'object') {
      Object.keys(injection[key]).forEach(key2 => {
        console.log(key2)
        // walk.findNodeAfter(node).value = injection[key][key2]
        /// if (t.isIdentifier(node, {name: key2})) {
        ///  path.getSibling(path.key + 1).container.value.value = injection[key][key2]
        /// }
      })
    } else if (typeof injection[key] === 'string') {

      }
    })
  const gen = recast.print(ast).code
  console.log(gen)
  _emitter(gen)

  return exit
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
  // const generated = escodegen.generate(ast, opts.astGenerator)

}
