import Wpicker from "../../../wpicker/wpicker";

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
    list.push({ value: i, text: i });
  }
  return list;
}

const source = getNumbers(20, 200);

const wpickerNormal = new Wpicker({
  elem: "#wpicker-normal",
  qty: 21,
  type: "normal",
  source: source,
  onChange: selected => {}
});

const wpickerInfinite = new Wpicker({
  elem: "#wpicker-infinite",
  qty: 21,
  type: "infinite",
  source: source,
  onChange: selected => {}
});

wpickerNormal.init();
wpickerInfinite.init();

setTimeout(() => {
  wpickerNormal.select(80);
  wpickerInfinite.select(80);
}, 0);
