import Wpicker from '../../../wpicker/wpicker';


// Implementation

/**
 * get item list of values
 * @param {number} from first value
 * @param {number} to last value
 * @return {Array} array of items {value: xx, text: xx}
 */
function getNumbers(from, to) {
  const list = [];
  for (let i = from; i <= to; i++) {
    list.push({value: i, text: i});
  }
  return list;
}

const source = getNumbers(20, 200);

const wpicker = new Wpicker({
  elem: '.wpicker',
  qty: 21,
  type: 'normal',
  source: source,
  onChange: (selected) => {},
});

wpicker.init();

setTimeout(() => {
  wpicker.select(80);
}, 0);
