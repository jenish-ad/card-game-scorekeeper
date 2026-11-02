/* global __filename */
const ts = require('typescript');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');

module.exports = {
  getCacheKey(sourceText, sourcePath) {
    return createHash('sha256')
      .update(sourceText)
      .update(sourcePath)
      .update(readFileSync(__filename))
      .digest('hex');
  },
  process(sourceText, sourcePath) {
    return {
      code: ts.transpileModule(sourceText, {
        fileName: sourcePath,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
          inlineSourceMap: true,
          inlineSources: true,
        },
      }).outputText,
    };
  },
};
