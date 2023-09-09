import ts from 'typescript';

function prettyPrint(x: any) { console.dir(x, {depth:null}); }

export function printAst(ast: ts.Node) {
  // Create a Printer to generate the TypeScript code
  const printer = ts.createPrinter();

  // Generate the TypeScript code with type annotations
  console.log( 
    printer.printNode(
      ts.EmitHint.Unspecified, 
      ast,
      undefined as any
    )
  );
}


/* Helpers */
export function getDefaultExportFunction(source: ts.) {
  return source.statements.find(
    s => ts.isFunctionDeclaration(s) 
    && s.modifiers
    && s.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
    && s.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)
  ) 
  ??
  (() => {
      throw(
        new Error(
          `My Custom Error: Could not find default export function in ${source.fileName}`
        )
      )
  })();
}


/* Operations */

function compileJsxToEs(jsxCode) {
  // Transpile the code
  return ts.transpile(jsxCode, {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React
    }
  );
}

function compileJsxToEs2(jsxCode) {
// Create a SourceFile from the JSX code
  const sourceFile = ts.createSourceFile(
    "example.tsx", // Filename with .tsx extension
    jsxCode,       // Source code
    ts.ScriptTarget.Latest,
    false,          // Set to true for JSX parsing
    ts.ScriptKind.TSX
  );

  // Create CompilerOptions
  const compilerOptions = {
    target: ts.ScriptTarget.ESNext, // Target ESNext
    module: ts.ModuleKind.CommonJS,
  };

  // Create a Program using the SourceFile and CompilerOptions
  const program = ts.createProgram([sourceFile.fileName], compilerOptions);

  // Emit the ESNext code
  const emitResult = program.emit(null, (_, res) => console.log(res));
  console.log(emitResult);
  return program;
}

function compileJsxToEs3(jsxCode) {
  const sourceFile = ts.createSourceFile(
      "example.tsx", // Filename
      jsxCode,    // Source code
      ts.ScriptTarget.Latest
  );

  return ts
    .createPrinter()
    .printNode(
      ts.EmitHint.Unspecified, 
      sourceFile, 
      sourceFile
    );

}

export function createEmptyReactComponentAst(funName: string) {
  console.log(ts);
  return ts.factory.createFunctionDeclaration(
    // export default
    [
      ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
      ts.factory.createToken(ts.SyntaxKind.DefaultKeyword)
    ],

    undefined,

    // functionName
    ts.factory.createIdentifier(funName),

    undefined,

    // parameters
    [], 

    undefined,

    // { ... code as statement list ...}
    ts.factory.createBlock([
      // return <></>;
      ts.factory.createReturnStatement(
        ts.factory.createParenthesizedExpression(
          ts.factory.createJsxFragment(
            ts.factory.createJsxOpeningFragment(),
            [],
            ts.factory.createJsxJsxClosingFragment(),
          )
        )
      )
    ],

    true)
  );
}

function createEmptyReactComponentSource(funName: string): ts.BlockLike{
  sourceFile.statements = [
    createEmptyReactComponentAst(funName)
  ];

  return sourceFile;
}

export function addChild(a, b, ix=0) {
  const bName = getDefaultExportFunction(b).name.escapedText;

  // add import statement
  a.statements
  .unshift(
    ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createIdentifier(bName),
      ts.factory.createStringLiteral(`./${bName}`),
      undefined
    )
  );

  // append to end of jsx fragment
  getDefaultExportFunction(a)
    .body
    .statements
    .find(ts.isReturnStatement)
    .expression // assume parenthesized
    .expression // assume JsxFragment
    .children
    .splice(ix, 0, 
      ts.factory.createJsxSelfClosingElement(
        ts.factory.createIdentifier(bName), 
        undefined, 
        undefined
      )
    );

  return a;
}

// function addParameter(a, p) {
// }

/* TESTS */

function addChildTest() {
  console.log('addChild Test');
  const a = createEmptyReactComponentSource("A", {});
  const b = createEmptyReactComponentSource("B", {});

  console.log("add B");
  printAst(
    addChild(a, b)
  );

  const c = createEmptyReactComponentSource("C", {});
  const d = createEmptyReactComponentSource("D", {});

  console.log("add D at index 1");
  printAst(
    addChild(a, d, 1)
  );

  console.log("add C at index 1");
  printAst(
    addChild(a, c, 1)
  );

}
addChildTest();

function newNodeTest() {
  console.log('newNodeTest');
  printAst(
    createEmptyReactComponentSource("TestComponent")
  );
}
newNodeTest();


function jsxCodeEmitTest() {
  console.log('jsxCodeEmitTest');
  // Your JSX code as a string
  // const jsxCode = `
  //   const element = Hello, JSX!;
  //   console.log(element);
  // `;
  const jsxCode = "<div/>";

  console.log(`Source JSX code:\n${jsxCode}`);
  console.log(`Target ES code:\n${compileJsxToEs(jsxCode)}`);
}
jsxCodeEmitTest();