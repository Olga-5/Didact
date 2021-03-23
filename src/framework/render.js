const render = (element, container) => {
  const { type, props } = element;
  const { children } = props;

  const node =
    type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  const keysOfAttributes = Object.keys(props).filter(
    (key) => key !== 'children',
  );
  keysOfAttributes.forEach((key) => (node[key] = props[key]));

  container.appendChild(node);
  if (children.length) return children.forEach((child) => render(child, node));
};

export default render;
