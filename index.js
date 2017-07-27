
module.exports = function({ types: t }) {
  return {
    visitor: {
      CallExpression(path, state) {
        const callee = path.get("callee");

        const isRequire = callee.isIdentifier() && callee.node.name === "require";
        if (!isRequire) { 
          return;
        }

        const arg = path.get("arguments.0");
        if (!arg || arg.isGenerated()) {
          return;
        }

        if (path.scope.hasBinding(callee.node.name)) {
          // smh who shadows require?
          return;
        }

        const parent = path.parentPath;
        if (!parent.isVariableDeclarator()) {
          return;
        }

        const parentId = parent.get("id");  
        if (!parentId.isIdentifier()) {
          // could be something like `const {a, b, c} = require(something);`
          // let's leave it alone
          return;
        }

        const importName = parentId.node.name;

        const binding = path.scope.getBinding(importName);
        if (!binding) {
          // well, if it's not bound, there's probably side effects
          // and also no point in delaying it
          return;
        }

        for (const refPath of binding.referencePaths) {
          refPath.replaceWith(t.callExpression(refPath.node, []));
        }

        const cachedModuleId = path.scope.generateUidIdentifier("get" + importName);
        path.scope.push(t.variableDeclarator(cachedModuleId, t.nullLiteral()));
        path.replaceWith(t.functionExpression(
          // id
          parentId.node,

          // params
          [],

          // body
          t.blockStatement([
            t.returnStatement(
              t.conditionalExpression(
                cachedModuleId,
                cachedModuleId,
                t.assignmentExpression(
                  "=",
                  cachedModuleId,
                  path.node
                )
              )
            )
          ]),
         ));
      },
    }
  };
}
