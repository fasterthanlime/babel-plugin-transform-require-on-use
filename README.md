
# transform-require-on-use

This is a babel transform that conceptually transforms this:

```javascript
const module = require("module");

function somewhere () {
  if (condition) {
    module.doSomething();
  }
}
```

into this:

```javascript
const module = () => require("module");

function somewhere () {
  if (condition) {
    module().doSomething();
  }
}
```

That's it!

## Caveats

Modules with that have require-time side-effects will obviously not play well with this.

v1.0.0 is super naive, let's see where it goes.
