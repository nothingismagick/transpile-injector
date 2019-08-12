const generate = require("@babel/generator").default
const traverse = require("@babel/traverse").default
const { parse } = require("@babel/parser")
const t = require('@babel/types')
const { readFileSync, writeFileSync, ensureFileSync } = require('fs-extra')
const prettier = require("prettier")

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
 *      baseType: ReturnStatement,
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
 *    const exit = await transpileInjector(options, inpath, outpath, injection)
 *
 * @param {string} inFile - original file path prepared for OS
 * @param {string} outFile - target filepath prepared for OS
 * @param {(object|string)} injection - object to inject
 * @param {Object} options
 * @param {string} options.strategy - [merge|skip]
 * @param {string} options.baseType - ensure node type
 * @param {boolean} options.strict - process.exit(1) on any error
 * @returns {Promise<{errMsg: *, exitCode: number}>}
 */
exports.transpileInjector = async (inFile, outFile, injection, options) => {
  // console.log('[works]')
  if (typeof injection !== 'object' && typeof injection !== 'string') {
    return _createExit(1,'[transpileInjector]: Injection not object or string.', options.strict)
  } else {
    try {
      source = readFileSync(inFile, 'utf8')
    } catch (err) {
      return _createExit(1, err, options.strict)
    }
  }

  const ast = parse(source, {
    sourceType: 'module' // detect what we need
  })

  traverse(ast, {
    enter(path) {
      if (path.findParent((path) => path.node.type === options.baseType)) {
        Object.keys(injection).forEach(key => {
          // console.log(key)
          if (typeof injection[key] === 'object') {
            Object.keys(injection[key]).forEach(key2 => {
              if (t.isIdentifier(path.node, {name: key2})) {
                path.getSibling(path.key + 1).container.value.value = injection[key][key2]
              }
            })
          } else if (typeof injection[key] === 'string') {
            if (t.isIdentifier(path.node, {name: key})) {
              path.getSibling(path.key + 1).container.value.value = injection[key]
            }
          } else if (typeof injection[key].isArray === 'undefined') {
            if (t.isIdentifier(path.node, {name: key})) {
              path.getSibling(path.key + 1).container.value.value = injection[key]
            }
          }
        })
      }
    }
  })

  // recreate code from AST
  const generated = generate(ast, {
    retainLines: true
  }, source)

  ensureFileSync(outFile)
  // prettify and write to FS
  writeFileSync(outFile, prettier.format(generated.code, {
    editorConfig: true,
    parser: 'babel',
    singleQuote: true
  }), 'utf8')

  return exit
}
