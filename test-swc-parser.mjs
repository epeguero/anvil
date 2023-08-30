import fs from 'fs/promises';
import * as swc from '@swc/core';
 
async function content(path) {  
  return await fs.readFile(path, 'utf8');
}

async function parse(path) {
  return content(path)
    .then((sourceCode) => 
      swc
        .parse(sourceCode, {
          syntax: "typescript", // "ecmascript" | "typescript"
          comments: false,
          script: true,

          tsx: true,

          // Defaults to es3
          target: "esnext",

          // Input source code are treated as module by default
          isModule: true,
        })
        .then((module) => {
          // module.type; // file type
          // module.body; // AST
          return module.body;
        })
    );
}

function isJSXElement(node) {
  const type = node.returnType?.typeAnnotation?.typeName;
  return type?.left?.value === 'JSX' && type?.right?.value === 'Element';
}

function retExpr(expr) {
  switch (expr.type) {
    case 'FunctionExpression':
      return retExpr(expr.body);
    case 'BlockStatement':
      return retExpr(expr.stmts.find(s => s.type === 'ReturnStatement'))
    case 'ReturnStatement':
      return retExpr(expr.argument)
    case 'ParenthesisExpression':
      return expr.expression;
    default:
      return null;
  }
}

function jsx(expr) {
  const e = retExpr(expr);
  return e?.type === 'JSXElement' ? e : null;
}

function jsxTags(e) {
  if(e.type != 'JSXElement') throw new Error('argument must be a JSXElement');

  const newTag = e.opening.name.value;
  const jsxChildren = 
    e.opening.selfClosing
    ? []
    : e.children.filter(child => child.type === 'JSXElement');

  return {
    tag: newTag,
    attributes: e.opening.attributes.reduce(
                  (accum, a) => {
                    accum[a.name.value] = jsxAttrValue(a.value);
                    return accum;
                  },
                  {}
                ),
    children: jsxChildren.map(child => jsxTags(child))
  };
}

function jsxAttrValue(v) {
  switch(v?.type) {
    case 'StringLiteral':
      return v.value;
    case 'JSXExpressionContainer':
      return v.expression;
    default:
      return undefined;
  }
}

function defaultExport(ast) {
  // const exportDeclarations = ast.filter(n => n.type === 'ExportDeclaration');
  const defaultExportDeclaration = ast.find(n => n.type === 'ExportDefaultDeclaration');
  // prettyPrint(defaultExportDeclaration);
  return jsx(defaultExportDeclaration.decl);
}

function prettyPrint(x) { console.dir(x, {depth:null}); }

(async () => {
  // const ast = await parse('app/test-page/layout.tsx');
  const ast = await parse('app/test-page/page.tsx');
  prettyPrint(
    jsxTags(
      defaultExport(ast)
    )
  );
  console.log(ast);
  // await swc.generate(ast); // THIS FUNCTION DOESN'T EXIST!
})();