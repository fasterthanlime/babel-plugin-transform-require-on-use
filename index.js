
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

        const binding = path.scope.bindings[parent.node.id.name];
        for (const refPath of binding.referencePaths) {
          refPath.replaceWith(t.callExpression(refPath.node, []));
        }

        path.replaceWith(t.functionExpression(
          // id
          parent.node.id,

          // params
          [],

          // body
          t.blockStatement([
            t.returnStatement(path.node)
          ]),
         ));
      },
    }
  };
}
