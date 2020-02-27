import 'core-js';

function toRed(elem) {
  elem.style.color = 'red';
}


window.onload = function () {
  let elem = document.querySelector('.title');
  toRed(elem)
}

