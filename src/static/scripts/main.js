import 'core-js';

//Class

class WheelPicker {
  constructor(elem, qty, source){
    this.elem = elem
    this.qty = qty
    this.source = source

    this.itemHeight = Math.floor(this.elem.clientHeight * Math.PI / this.qty)
    this.itemAngle = 360 / this.qty
    this.radius = this.itemHeight / Math.tan(this.itemAngle * Math.PI / 180)
  }

  init() {
    this._create(this.source)
  }

  _create(source) {

    if(!source.length) return

    let template = `
      <div class="wpicker__viewport"
        style="height: ${this.itemHeight}px";
      </div>
      <ul class="wpicker__list"
        style="transform: translate3d(0, 0, ${-this.radius}px)
                          rotateX(0deg);
              height: ${this.itemHeight}px"
      >
          {{list}}
      </ul>
    `
    let list = '';
    for (let i = 0; i < source.length; i++) {
      list+= `<li class="wpicker__item"
                style="
                height: ${this.itemHeight}px;
                transform: rotateX(${-this.itemAngle * i}deg) translate3d(0, 0, ${this.radius}px);">
                <div>${source[i]}<div>
              </li>`
    }

    this.elem.innerHTML = template.replace('{{list}}', list)
  }
}

//Implementation

function getNumbers(from, to) {
  let list = []
  for(let i = from; i <= to; i++) {
    list.push(i)
  }
  return list
}

let source = getNumbers(1, 16)
let elem = document.querySelector('.wpicker')

let wheelPicker = new WheelPicker(elem, source.length, source)

wheelPicker.init()


