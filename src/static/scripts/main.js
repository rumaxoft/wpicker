
const easing = {
  easeOutCubic: function(pos) {
    return (Math.pow((pos-1), 3) +1);
  },
  easeOutQuart: function(pos) {
    return -(Math.pow((pos-1), 4) -1);
  },
};
/**
 * WheelPicker Class
 */
class WheelPicker {
  /**
   * Create a WheelPicker
   * @param {Object} options
   */
  constructor(options) {
    const defaults = {
      elem: '', // css selector
      type: 'infinite', // infinite scroll, normal non-infinite
      // eslint-disable-next-line max-len
      qty: 20, // wheel size, the number of items in the wheel, must be set to a multiple of 4
      sensitivity: 1.5,
      source: [], // list of items {value: xx, text: xx},
      value: null,
      onChange: null,
    };

    this.options = Object.assign({}, defaults, options);
    this.options.qty = this.options.qty - this.options.qty % 4;
    Object.assign(this, this.options);

    this.halfQty = this.qty / 2;
    this.quarterQty = this.qty / 4;
    this.a = this.options.sensitivity * 10; // scroll deceleration
    this.selected = this.source[0];

    this.exceedA = 10; // deceleration beyond
    this.moveT = 0; // scroll tick
    this.moving = false;

    this.elems = {
      elem: document.querySelector(this.options.elem),
      list: null,
      items: null,
    };

    this.events = {
      touchstart: null,
      touchmove: null,
      touchend: null,
      wheel: null,
    };
    this.isFirefox = typeof InstallTrigger !== 'undefined';
    // firefox has another deltaY on wheel event
    this.wheelMultiplicator = this.isFirefox ? 5 : 0.7;
    // calculating height from circumference
    // eslint-disable-next-line max-len
    this.itemHeight = Math.floor(this.elems.elem.clientHeight * Math.PI / this.options.qty);
    // degree of rotation between each item
    this.itemAngle = 360 / this.options.qty;
    // wheel radius
    this.radius = this.itemHeight / Math.tan(this.itemAngle * Math.PI / 180);
    this. currentScroll = 0; // unit is itemHeight
    this.wheelCallback = null; // "wheel" event hasn't "wheel end" event
  }

  /**
   * creates elements in DOM and add event listeners
   */
  init() {
    this._create(this.options.source);

    const touchData = {
      startY: 0,
      yArr: [],
      touchScroll: null,
    };

    for (const eventName in this.events) {
      if ({}.hasOwnProperty.call(this.events, eventName)) {
        this.events[eventName] = ((eventName) => {
          return (e) => {
            e.preventDefault();
            if (this.source.length) {
              this['_' + eventName](e, touchData);
            }
          };
        })(eventName);
      }
    }

    this.elems.elem.addEventListener('touchstart', this.events.touchstart);
    this.elems.elem.addEventListener('mousedown', this.events.touchstart);
    this.elems.elem.addEventListener('touchend', this.events.touchend);
    document.addEventListener('mouseup', this.events.touchend);
    this.elems.elem.addEventListener('wheel', this.events.wheel);
    if (this.source.length) {
      this.value = this.value !== null ? this.value : this.source[0].value;
      this.select(this.value);
    }
  }

  /**
   * Create elements in DOM
   * @param {Array} source is array of items {value: xx, text: xx}
   */
  _create(source) {
    if (!source.length) return;

    const template = `
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
    `;
    if (this.options.type === 'infinite') {
      let concatSource = [].concat(source);
      while (concatSource.length < this.halfQty) {
        concatSource = concatSource.concat(source);
      }
      source = concatSource;
    }

    this.source = source;
    const sourceLength = source.length;

    let list = '';
    for (let i = 0; i < source.length; i++) {
      list += `<li class= "wpicker__item"
                  style="
                  height: ${this.itemHeight}px;
                  transform: rotateX(${-this.itemAngle * i}deg)
                              translate3d(0, 0, ${this.radius}px);"
                  data-index= "${i}">
                    <div class="wpicker__item-content">${source[i].text}<div>
                </li>`;
    }

    if (this.options.type === 'infinite') {
      // list head and tail
      for (let i = 0; i < this.quarterQty; i++) {
        // head
        list = `<li class="wpicker__item"
                  style="
                  height: ${this.itemHeight}px;
                  transform: rotateX(${this.itemAngle * (i + 1)}deg)
                              translate3d(0, 0, ${this.radius}px);"
                  data-index="${-i - 1}">
                    <div class="wpicker__item-content">
                      ${source[sourceLength - i - 1].text}
                    <div>
                </li>` + list;

        // tail
        list += `<li class="wpicker__item"
                  style="
                  height: ${this.itemHeight}px;
                  transform: rotateX(${-this.itemAngle * (i + sourceLength)}deg)
                              translate3d(0, 0, ${this.radius}px);"
                  data-index="${i + sourceLength}">
                    <div class="wpicker__item-content">
                      ${source[i].text}
                    <div>
                </li>`;
      }
    }

    this.elems.elem.innerHTML = template.replace('{{list}}', list);

    this.elems.list = this.elems.elem.querySelector('.wpicker__list');
    this.elems.items = this.elems.elem.querySelectorAll('.wpicker__item');
  }

  /**
   * Touchstart
   * @param {Object} e event object
   * @param {Object} touchData touchData object
   */
  _touchstart(e, touchData) {
    this.elems.elem.addEventListener('touchmove', this.events.touchmove);
    document.addEventListener('mousemove', this.events.touchmove);
    const eventY = e.clientY || e.touches[0].clientY;
    touchData.startY = eventY;
    touchData.yArr = [[eventY, new Date().getTime()]];
    touchData.touchScroll = this.currentScroll;
    this._stop();
  }

  /**
   * Touchmove
   * @param {Object} e event object
   * @param {Object} touchData touchData object
   */
  _touchmove(e, touchData) {
    const eventY = e.clientY || e.touches[0].clientY;
    touchData.yArr.push([eventY, new Date().getTime()]);

    const scrollAdd = (touchData.startY - eventY) / this.itemHeight;
    let moveToScroll = scrollAdd + this.currentScroll;

    if (this.type === 'normal') {
      moveToScroll = this._preventOverscrolling(moveToScroll);
    } else {
      moveToScroll = this._normalizeScroll(moveToScroll);
    }

    touchData.touchScroll = this._moveWheel(moveToScroll);
  }

  /**
   * Touchstend
   * @param {Object} e event object
   * @param {Object} touchData touchData object
   */
  _touchend(e, touchData) {
    this.elems.elem.removeEventListener('touchmove', this.events.touchmove);
    document.removeEventListener('mousemove', this.events.touchmove);

    let v;

    if (touchData.yArr.length === 1) {
      v = 0;
    } else {
      const startTime = touchData.yArr[touchData.yArr.length - 2][1];
      const endTime = touchData.yArr[touchData.yArr.length - 1][1];
      const startY = touchData.yArr[touchData.yArr.length - 2][0];
      const endY = touchData.yArr[touchData.yArr.length - 1][0];

      // calculation speed (itemHeight/second)
      v = ((startY - endY) / this.itemHeight) * 1000 / (endTime - startTime);
      const sign = v > 0 ? 1 : -1;
      v = Math.abs(v) > 30 ? 30 * sign : v; // max speed
    }

    this.currentScroll = touchData.touchScroll;
    this._animateMoveByInitV(v);
  }

  /**
   * Wheel event
   * @param {Object} e event object
   */
  _wheel(e) {
    const scrollAdd = e.deltaY/this.itemHeight*this.wheelMultiplicator;
    let moveToScroll = this.currentScroll + scrollAdd;

    if (this.type === 'normal') {
      moveToScroll = this._preventOverscrolling(moveToScroll);
    } else {
      moveToScroll = this._normalizeScroll(moveToScroll);
    }

    this.currentScroll = this._moveWheel(moveToScroll);

    window.clearTimeout(this.wheelCallback);

    this.wheelCallback = setTimeout(() => {
      this._selectByScroll(this.currentScroll);
    }, 300);
  }
  /**
   * changes angle of the wheel
   * whithout animation
   * @param {number} scroll
   * @return {number} scroll after the specified normalize
   */
  _moveWheel(scroll) {
    if (this.type === 'infinite') {
      scroll = this._normalizeScroll(scroll);
    }

    this.elems.list.style.transform = `translate3d(0, 0, ${-this.radius}px)
                                        rotateX(${this.itemAngle * scroll}deg)`;

    [...this.elems.items].forEach((itemElem) => {
      if (Math.abs(itemElem.dataset.index - scroll) > this.quarterQty) {
        itemElem.style.visibility = 'hidden';
      } else {
        itemElem.style.visibility = 'visible';
      }
    });

    return scroll;
  }

  /**
   * Prevent overscrolling
   * @param {number} scroll
   * @return {number} scroll
   */
  _preventOverscrolling(scroll) {
    if (scroll < 0) {
      scroll *= 0.3;
    } else if (scroll > this.source.length) {
      scroll = this.source.length + (scroll - this.source.length) * 0.3;
    }

    return scroll;
  }

  /**
   * keeps the scroll in source.length range,
   * e.g. source.length = 16, scroll = 17.5
   * _normalizedScroll(scroll) = 1.5
   * @param {number} scroll
   * @return {number} normalizedScroll after modulus
  */
  _normalizeScroll(scroll) {
    let normalizedScroll = scroll;

    while (normalizedScroll < 0) {
      normalizedScroll += this.source.length;
    }
    normalizedScroll = normalizedScroll % this.source.length;
    return normalizedScroll;
  }


  /**
   * Scroll at initial speed ininV
   * @param {number} initV, initV will be reset
   * According to the acceleration,
   * scroll value will be round up to the nearest integer value
   */
  async _animateMoveByInitV(initV) {
    let initScroll;
    let finalScroll;

    let totalScrollLen;
    let a;
    let t;

    if (this.type === 'normal') {
      if (this.currentScroll < 0 ||
          this.currentScroll > this.source.length - 1) {
        a = this.exceedA;
        initScroll = this.currentScroll;
        finalScroll = this.currentScroll < 0 ? 0 : this.source.length - 1;
        totalScrollLen = initScroll - finalScroll;
        t = Math.sqrt(Math.abs(2*totalScrollLen / a));
        await this._animateToScroll(initScroll, finalScroll, t);
      } else {
        initScroll = this.currentScroll;
        a = initV > 0 ? -this.a : this.a; // deceleration
        t = Math.abs(initV / a); // it takes time to reduce the speed to 0
        totalScrollLen = initV * t + a * t * t / 2; // total scroll length
        // round to ensure that the final scroll value is accurate to an integer
        finalScroll = Math.round(this.currentScroll + totalScrollLen);
        finalScroll = finalScroll < 0 ?
          0 : (
                finalScroll > this.source.length - 1 ?
                  this.source.length - 1 : finalScroll
              );
        totalScrollLen = finalScroll - initScroll;
        // eslint-disable-next-line max-len
        await this._animateToScroll(this.currentScroll, finalScroll, t, 'easeOutQuart');
      }
    } else {
      a = initV > 0 ? -this.a : this.a; // deceleration
      t = Math.abs(initV / a); // it takes time to reduce the speed to 0
      totalScrollLen = initV * t + a * t * t / 2; // total scroll length
      // round to ensure that the final scroll value is accurate to an integer
      finalScroll = Math.round(this.currentScroll + totalScrollLen);
      // eslint-disable-next-line max-len
      await this._animateToScroll(this.currentScroll, finalScroll, t, 'easeOutQuart');
    }

    this._selectByScroll(this.currentScroll);
  }

  // eslint-disable-next-line valid-jsdoc
  /**
   * Scroll animation
   * @param {number} initScroll
   * @param {number} finalScroll
   * @param {number} t time in seconds
   * @param {string} easingName
   */
  _animateToScroll(initScroll, finalScroll, t, easingName = 'easeOutQuart') {
    if (initScroll === finalScroll || t === 0) {
      this._moveWheel(initScroll);
      return;
    }

    const start = new Date().getTime() / 1000;
    let pass = 0;
    const totalScrollLen = finalScroll - initScroll;

    return new Promise((resolve, reject) => {
      this.moving = true;
      const tick = () => {
        pass = new Date().getTime() / 1000 - start;

        if (pass < t) {
          const delta = easing[easingName](pass / t) * totalScrollLen;
          this.currentScroll = this._moveWheel(initScroll + delta );
          this.moveT = requestAnimationFrame(tick);
        } else {
          resolve();
          this._stop();
          this.currentScroll = this._moveWheel(initScroll + totalScrollLen);
        }
      };
      tick();
    });
  }

  /**
   * stop animation
   */
  _stop() {
    this.moving = false;
    cancelAnimationFrame(this.moveT);
  }

  /**
   * selecting current value after scrolling
   * @param {number} scroll
   */
  async _selectByScroll(scroll) {
    const initScroll = scroll;
    if (this.type === 'infinite') {
      scroll = Math.round(this._normalizeScroll(scroll));
    }
    scroll = Math.round(scroll);
    if (scroll > this.source.length - 1) {
      scroll = this.source.length - 1;
      await this._animateToScroll(initScroll, scroll, 0.3, 'easeOutQuart');
    } else {
      await this._animateToScroll(initScroll, scroll, 0.3, 'easeOutQuart');
    }
    this.currentScroll = scroll;
    this.selected = this.source[scroll];
    this.value = this.selected.value;
    this.onChange && this.onChange(this.selected);
  }

  /**
   * select initial value
   * @param {any} value value from item-list
   */
  select(value) {
    for (let i = 0; i < this.source.length; i++) {
      if (this.source[i].value === value) {
        window.cancelAnimationFrame(this.moveT);
        const initScroll = this._normalizeScroll(this.currentScroll);
        const finalScroll = i;
        const t = Math.sqrt(Math.abs((finalScroll - initScroll) / this.a));
        this._animateToScroll(initScroll, finalScroll, t);
        setTimeout(() => this._selectByScroll(i));
        return;
      }
    }
    throw new Error(`Can't select value: ${value},
                    ${value} doesn't exist in source list`);
  }

  /**
   * Destroy wheel
   */
  destroy() {
    this._stop();
    // document event remove
    for (const eventName in this.events) {
      if ({}.hasOwnProperty.call(this.events, eventName)) {
        // eslint-disable-next-line max-len
        this.elems.elem.removeEventListener(`${eventName}`, this.events[eventName]);
      }
    }
    this.elems.elem.removeEventListener('mousedown', this.events['touchstart']);
    document.removeEventListener('mousemove', this.events['touchmove']);
    document.removeEventListener('mouseup', this.events['touchend']);
    // remove element
    this.elems.el.innerHTML = '';
    this.elems = null;
  }
}


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

const wheelPicker = new WheelPicker({
  elem: '.wpicker',
  qty: 21,
  type: 'normal',
  source: source,
  onChange: (selected) => {
  },
});

wheelPicker.init();

setTimeout(() => {
  wheelPicker.select(80);
}, 0);
