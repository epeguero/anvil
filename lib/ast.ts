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
