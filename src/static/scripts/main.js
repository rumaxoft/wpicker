import 'core-js';

const itemList= document.querySelectorAll('.wpicker__item-content')

function loop() {
  return () => {
    for (let i = 1; i <= 20; i++) {
      setTimeout(() => {
        itemList[i-1].classList.add('wpicker__item-content--scaled');
      }, (i-2)*1000+800);

      setTimeout(() => {
        itemList[i-1].classList.remove('wpicker__item-content--scaled');
      }, ((i-1)*1000+300))
    }
  }
}

const loop1 = loop();

loop1();

setInterval(loop1, 20000)

