import * as ts from "typescript";

export function printAst(ast: ts.Node) {
  return ts.createPrinter().printNode(
      ts.EmitHint.Unspecified, 
      ast,
      undefined as any
  )
}

export function jsxSelfClose(name: string) {
  return (
    ts.factory.createJsxSelfClosingElement(
      ts.factory.createIdentifier(name),
      [],
      ts.factory.createJsxAttributes([])
    )
  )
}

export function jsxFun(name: string, children: string[] = []) {
  return ts.factory.createFunctionDeclaration(
    [ts.SyntaxKind.ExportKeyword, ts.SyntaxKind.DefaultKeyword]
      .map((k) => ts.factory.createModifier(k as ts.ModifierSyntaxKind)),
    undefined,
    ts.factory.createIdentifier(name),
    [],
    [],
    undefined,
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createParenthesizedExpression(
            ts.factory.createJsxFragment(
              ts.factory.createJsxOpeningFragment(),
              children.map(jsxSelfClose),
              ts.factory.createJsxJsxClosingFragment()
            )
          )
        )
      ]
    )
  )
}

export function importDecl(importClause: string, moduleSpec: string) {
  return ts.factory.createImportDeclaration(
    [],
    ts.factory.createImportClause(
      false,
      ts.factory.createIdentifier(importClause),
      undefined
    ),
    ts.factory.createStringLiteral(moduleSpec),
    undefined
  );
}

export function tsx(name: string, children: string[] = [], externalDeps: ts.ImportDeclaration[] = []) {
  const tsx = ts.createSourceFile(
    `${name}.tsx`,
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  tsx.statements = ts.factory.createNodeArray([
    ...externalDeps,
    ...children.map(c => importDecl(c, `./${c}`)),
    jsxFun(name, children)
  ]);

  return tsx;
}

function ast(code: string) {
  return ts.createSourceFile(
    'code.tsx',
    code,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
}

export function getProps(code: string): string[] {
  const bindings = getPropsBindingPattern(ast(code));
  return (bindings?.elements.map(e => e.name.escapedText) || [])
}

export function addProps(code: string, prop: string) {
  const codeAst = ast(code);

  const propsBindings = getPropsBindingPattern(codeAst);
  const propsBindingsElements = (propsBindings?.elements || ts.factory.createNodeArray()).concat(
    ts.factory.createBindingElement(
      undefined, undefined, ts.factory.createIdentifier(prop), undefined
    )
  );

  if(propsBindings) {
    propsBindings.elements = propsBindingsElements;
  }
  else {
    getDefaultExportFunction(codeAst).parameters = 
      ts.factory.createNodeArray([
        ts.factory.createObjectBindingPattern(propsBindingsElements)
      ])
  }
  return printAst(codeAst);
}

function getPropsBindingPattern(ast: ts.SourceFile): ts.ObjectBindingPattern | null {
  return getDefaultExportFunction(ast)
    .parameters[0]?.name as ts.ObjectBindingPattern | null;
}

function getDefaultExportFunction(source: ts.SourceFile): ts.FunctionDeclaration {
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
