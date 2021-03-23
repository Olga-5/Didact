/* eslint-disable react/no-deprecated */
/** @jsxRuntime classic */
/** @jsx Didact.createElement */

import Didact from './framework';

const element = (
  <div id="example">
    <h1>Hello</h1>
    <hr />
    <p>
      <i>How are you doing?</i>
    </p>
  </div>
);
// ||
// \/
// const element = Didact.createElement(
//   'div',
//   { id: 'example' },
//   Didact.createElement('h1', null, 'Hello'),
//   Didact.createElement('hr', null),
//   Didact.createElement('p', null, Didact.createElement('i', null, 'How are you doing?')),
// )
// ||
// \/
// const element = ({
//   type: 'div',
//   props: {
//     id: 'example',
//     children: [
//       {
//         type: 'h1'.
//         props: {
//           children: [ { type: 'TEXT_ELEMENT', props: { nodeValue: 'Hello', children: []} } ],
//         },
//       },
//       {
//         type: 'hr',
//         prop: {
//           children: [],
//         },
//       },
//       {
//         type: 'p',
//         props: {
//           children: [
//             {
//               type: 'i',
//               props: {
//                 children: [ { type: 'TEXT_ELEMENT', props: { nodeValue: 'How are you doing?', children: [] } } ],
//               },
//             }
//           ]
//         }
//       }
//     ]
//   }
// })

const container = document.getElementById('root');
Didact.render(element, container);
