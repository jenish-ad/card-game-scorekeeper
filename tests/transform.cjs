const ts = require('typescript');

module.exports = {
  process(sourceText, sourcePath) {
    return {
      code: ts.transpileModule(sourceText, {
        fileName: sourcePath,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
          inlineSourceMap: true,
          inlineSources: true,
        },
      }).outputText,
    };
  },
};
