const createTextElement = (value) => ({
  type: 'TEXT_ELEMENT',
  props: {
    nodeValue: value,
    children: [],
  }
})

const createElement = (tag, props, ...children) => ({
  type: tag,
  props: {
    ...props,
    children: children.map((child) => typeof child === 'object' ? child : createTextElement(child)),
  }
});

export default createElement;