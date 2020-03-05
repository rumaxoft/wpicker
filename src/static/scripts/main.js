import 'core-js';

//Class

class WheelPicker {

  constructor(options){

    let defaults = {
      elem: '',
      type: 'infinite', // infinite, normal
      qty: 20,
      source: [], // {value: xx, text: xx},
      value: null
    }
    this.options = Object.assign({}, defaults, options)
    this.options.qty =  this.options.qty - this.options.qty % 4
    Object.assign(this, this.options);

    this.halfQty = this.qty / 2;
    this.quarterQty = this.qty / 4;

    this.elems = {
      elem: document.querySelector(this.options.elem),
      list: null,
      items: null
    }

    this.events = {
      touchstart: null,
      touchmove: null,
      touchend: null,
      wheel: null
    }
    this.itemHeight = Math.floor(this.elems.elem.clientHeight * Math.PI / this.options.qty)
    this.itemAngle = 360 / this.options.qty
    this.radius = this.itemHeight / Math.tan(this.itemAngle * Math.PI / 180)
    this. currentScroll = 0 //unit is itemHeight


  }

  init() {

    this._create(this.options.source)

    let touchData = {
      startY: 0,
      yArr: []
    };

    for (let eventName in this.events) {
      this.events[eventName] = ((eventName) => {
        return (e) => {
          if (this.elems.elem.contains(e.target) || e.target === this.elems.elem) {
            e.preventDefault();
            if (this.source.length) {
              this['_' + eventName](e, touchData);
            }
          }
        };
      })(eventName);
    }

    this.elems.elem.addEventListener('touchstart', this.events.touchstart);
    this.elems.elem.addEventListener('touchend', this.events.touchend);
    this.elems.elem.addEventListener('wheel', this.events.wheel);
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
    if (this.options.type === 'infinite') {
      let concatSource = [].concat(source)
      while (concatSource.length < this.halfQty) {
        concatSource = concatSource.concat(source)
      }
      source = concatSource;
    }

    this.source = source;
    let sourceLength = source.length;

    let list = '';
    for (let i = 0; i < source.length; i++) {
      list +=   `<li class= "wpicker__item"
                  style="
                  height: ${this.itemHeight}px;
                  transform: rotateX(${-this.itemAngle * i}deg) translate3d(0, 0, ${this.radius}px);"
                  data-index= "${i}">
                    <div class="wpicker__item-content">${source[i].text}<div>
                </li>`
    }

    if (this.options.type === 'infinite') {

      for (let i = 0; i < this.quarterQty; i++) {

        list = `<li class="wpicker__item"
                  style="
                  height: ${this.itemHeight}px;
                  transform: rotateX(${this.itemAngle * (i + 1)}deg) translate3d(0, 0, ${this.radius}px);"
                  data-index="${-i - 1}">
                    <div class="wpicker__item-content">
                      ${source[sourceLength - i - 1].text}
                    <div>
                </li>` + list;

        list += `<li class="wpicker__item"
                  style="
                  height: ${this.itemHeight}px;
                  transform: rotateX(${-this.itemAngle * (i + sourceLength)}deg) translate3d(0, 0, ${this.radius}px);"
                  data-index="${i + sourceLength}">
                    <div class="wpicker__item-content">
                      ${source[i].text}
                    <div>
                </li>`
      }
    }

    this.elems.elem.innerHTML = template.replace('{{list}}', list)

    this.elems.list = this.elems.elem.querySelector('.wpicker__list')
    this.elems.items = this.elems.elem.querySelectorAll('.wpicker__item')
  }

  _touchstart(e, touchData) {

    this.elems.elem.addEventListener('touchmove', this.events.touchmove);
    let eventY = e.touches[0].clientY;
    touchData.startY = eventY;
    touchData.touchScroll = this.currentScroll;
  }

  _touchmove(e, touchData) {

    let eventY = e.touches[0].clientY;

    let scrollAdd = (touchData.startY - eventY) / this.itemHeight
    let moveToScroll = scrollAdd + this.currentScroll;

    if (this.type === 'normal') {
      moveToScroll = this._preventOverscrolling(moveToScroll)

    } else {
      moveToScroll = this._normalizeScroll(moveToScroll)
    }

    touchData.touchScroll = this._moveWheel(moveToScroll)
  }

  _touchend(e, touchData) {
    this.elems.elem.removeEventListener('touchmove', this._touchmove)
    this.currentScroll = touchData.touchScroll
  }

  _wheel(e, touchData) {
    let moveToScroll = this.currentScroll + e.deltaY/this.itemHeight
    if (this.type === 'normal') {
      moveToScroll = this._preventOverscrolling(moveToScroll)

    } else {
      moveToScroll = this._normalizeScroll(moveToScroll)
    }
    this.currentScroll = this._moveWheel(moveToScroll)
  }

  _moveWheel(scroll) {

    this.elems.list.style.transform = `translate3d(0, 0, ${-this.radius}px) rotateX(${this.itemAngle * scroll}deg)`;

    [...this.elems.items].forEach(itemElem => {
      if (Math.abs(itemElem.dataset.index - scroll) > this.quarterQty) {
        itemElem.style.visibility = 'hidden';
      } else {
        itemElem.style.visibility = 'visible';
      }
    })

    return scroll;
  }

  _preventOverscrolling(moveToScroll) {

    if (moveToScroll < 0) {
      moveToScroll *= 0.3;
    } else if (moveToScroll > this.source.length) {
      moveToScroll = this.source.length + (moveToScroll - this.source.length) * 0.3;
    }

    return moveToScroll
  }

  _normalizeScroll(scroll) {
    let normalizedScroll = scroll;

    while(normalizedScroll < 0) {
      normalizedScroll += this.source.length;
    }
    normalizedScroll = normalizedScroll % this.source.length;
    return normalizedScroll;
  }


}


//Implementation

function getNumbers(from, to) {
  let list = []
  for(let i = from; i <= to; i++) {
    list.push({value: i, text: i})
  }
  return list
}

let source = getNumbers(1, 40)
let elem = '.wpicker'

let wheelPicker = new WheelPicker({
  elem: '.wpicker',
  qty: 21,
  type: 'infinite',
  source: source
})

wheelPicker.init()

console.dir(wheelPicker)

