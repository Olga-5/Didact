const createTextElement = (text) => {
  return ({
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    }
  })
}

const createElement = (type, props, ...children) => {
  return ({
    type,
    props: {
      ...props,
      children: children.map(child => 
        typeof child === 'object' ? child : createTextElement(child)
      ),
    }
  })
}

const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
const isEvent = (key) => key.startsWith('on');

const createDom = (fiber) => {
  const dom = fiber.type === "TEXT_ELEMENT" ?
    document.createTextNode("") :
    document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props)
  
  return dom;
};

const updateDom = (dom, prevProps, nextProps) => {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ""
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

const render = (element, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber; 
    }

    prevSibling = newFiber;
    index++;
  }
}

let wipFiber = null;
let hookIndex = null;

const updateFunctionComponent = (fiber) => {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [] 
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children)
};

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  const { children } = fiber.props;
  reconcileChildren(fiber, children);
}

const useState = (initial) => {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => hook.state = action(hook.state));
  
  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot;
    deletions = [];
  }

  wipFiber.hooks.push(hook);
  hookIndex++
  return [hook.state, setState];
}

const performUnitOfWork = (fiber) => {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

const commitDeletion = (fiber, domParent) => {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

const commitWork = (fiber) => {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const commitRoot = () => {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

const workLoop = (deadline) => {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  window.requestIdleCallback(workLoop);
}

window.requestIdleCallback(workLoop);

const Didact = {
  createElement,
  render,
  useState,
}

/** @jsxRuntime classic */
/** @jsx Didact.createElement */
// const element = (
//   <div id="foo">
//     <a href='/'>bar</a>
//     <b />
//   </div>
// )
        // ||
        // \/ 
// const element = Didact.f(
//   'div',
//   { id: 'foo'},
//   Didact.createElement('a', null, 'bar'),
//   Didact.createElement('b'),
// )
        // ||
        // \/ 
// const element = {
//   type: 'div',
//   props: {
//     id: 'foo',
//     children: [
//       Didact.createElement('a', null, 'bar'),
//       Didact.createElement('b'),
//     ]
//   }
// }
        // ||
        // \/ 
// const element = {
//   type: 'div',
//   props: {
//     id: 'foo',
//     children: [
//       {
//         type: 'a',
//         props: {
//           children: [{ type: 'TEXT_ELEMENT', props: { nodeValue: 'bar', children: [] } }],
//         },
//       },
//       {
//         type: 'b',
//         props: {
//           children: [],
//         }
//       }
//     ]
//   }
// }

// const container = document.getElementById("root")
// Didact.render(element, container);


// // example
// const container = document.getElementById("root")

// const updateValue = e => {
//   console.log(e.target.value);
//   rerender(e.target.value)
// }

// const rerender = value => {
//   console.log(value);
//   const element = (
//     <div>
//       <input onInput={updateValue} value={value} />
//       <h2>Hello {value}</h2>
//     </div>
//   )
//   Didact.render(element, container)
// }

// rerender("World")


// // example
// const App = (props) => <h1>Hi {props.name}</h1>
// // const App = (props) => (
// //   Didact.createElement('h1', null, "Hi", props.name);
// // )

// const element = <App name="foo" />
// // const element = Didact.createElement(App, { name: "foo" });

// const container = document.getElementById('root');

// Didact.render(element, container);

// example
const Counter = () => {
  const [value, setValue] = Didact.useState(1);
  
  return (
    <div>
      <h1>
        Count: {value}
      </h1>
      <p>
        <button onClick={() => setValue((value) => value + 1)}>+</button>
      </p>
    </div>
  )
}

const element = <Counter />
const container = document.getElementById('root');

Didact.render(element, container);