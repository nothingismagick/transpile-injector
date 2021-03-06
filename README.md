# transpile-injector
Node Module for AST-based file modification for sticky situations. 

Early Preview.

## Install
```
$ yarn add transpile-injector
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
 *    const exit = await transpileInjector(opts, inpath, outpath, injection)
 *
 * @param {string} inFile - original file path prepared for OS
 * @param {string} outFile - target filepath prepared for OS
 * @param {(object|string)} injection - object to inject
 * @param {Object} opts
 * @param {string} opts.strategy - [merge|skip]
 * @param {string} opts.baseType - ensure node type
 * @param {boolean} opts.strict - process.exit(1) on any error
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
