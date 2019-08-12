# transpile-injector
Node Module for AST-based file modification for sticky situations. 

Early Preview.

## Install
```
$ yarn add transpileInjector
```

Import and use:
```js
const { transpileInjector } = require('transpile-injector')
```


## JSDocs
```
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
 ```

## Testing
``` 
$ node test/index.js
```

## License
2019 (c) Daniel Thompson-Yvetot

MIT
