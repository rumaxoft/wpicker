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
    this. currentScroll= 0 //unit is itemHeight

    this.events = {
      touchstart: null,
      touchmove: null,
      touchend: null,
      wheel: null
    }
  }

  init() {

    this._create(this.source)

    let touchData = {
      startY: 0,
      yArr: []
    };

    for (let eventName in this.events) {
      this.events[eventName] = ((eventName) => {
        return (e) => {
          if (this.elem.contains(e.target) || e.target === this.elem) {
            e.preventDefault();
            if (this.source.length) {
              this['_' + eventName](e, touchData);
            }
          }
        };
      })(eventName);
    }

    this.elem.addEventListener('touchstart', this.events.touchstart);
    this.elem.addEventListener('touchend', this.events.touchend);
    this.elem.addEventListener('wheel', this.events.wheel);
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
                <div class="wpicker__item-content">${source[i]}<div>
              </li>`
    }

    this.elem.innerHTML = template.replace('{{list}}', list)

    this.list = elem.querySelector('.wpicker__list')
  }

  _touchstart(e, touchData) {

    this.elem.addEventListener('touchmove', this.events.touchmove);
    let eventY = e.touches[0].clientY;
    touchData.startY = eventY;
    touchData.touchScroll = this.currentScroll;
  }

  _touchmove(e, touchData) {

    let eventY = e.touches[0].clientY;

    let scrollAdd = (touchData.startY - eventY) / this.itemHeight;
    let moveToScroll = scrollAdd + this.currentScroll;

    touchData.touchScroll = this._moveWheel(moveToScroll);
  }

  _touchend(e, touchData) {
    this.elem.removeEventListener('touchmove', this._touchmove);
    this.currentScroll = touchData.touchScroll
  }

  _wheel(e, touchData) {
    let moveToScroll = this.currentScroll + e.deltaY/this.itemHeight
    this.currentScroll = this._moveWheel(moveToScroll)
  }

  _moveWheel(scroll) {

    this.list.style.transform = `translate3d(0, 0, ${-this.radius}px) rotateX(${this.itemAngle * scroll}deg)`;

    return scroll;
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

let source = getNumbers(1, 20)
let elem = document.querySelector('.wpicker')

let wheelPicker = new WheelPicker(elem, source.length, source)

wheelPicker.init()

