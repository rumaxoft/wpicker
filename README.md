# Wpicker


Wpicker is a light-weight, dependency free IOs-like ui-picker.
Demos and full documentation available on Github Pages: https://rumaxoft.github.io/wheel-picker/

### Quick start

Include wheel-picker.min.css:

```html
<link rel="stylesheet" href="wheel-picker.min.css">
or
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/wheel-picker@1/wheeel-picker.min.css">
```

Include wheel-picker.min.js:

```html
<script src="wheel-picker.min.js"></script>
or
<script src="https://cdn.jsdelivr.net/npm/wheel-picker@1/wheel-picker.min.js"></script>
```

Example HTML:

```html
<div id="wheel-picker">
</div>
```

Wheel-picker Initialization

```javascript
const source = [
    {value: 1, text: '1'},
    {value: 2, text: '2'},
    {value: 3, text: '3'},
    {value: 4, text: '4'},
    {value: 5, text: '5'}
]
new WheelPicker({
  elem: '#wheel-picker',
  source: source,
  onChange: (selected) => {}
});
```

Wpicker full options with default values:

```javascript
new WheelPicker({
  // css selector of the element
  elem: '',
  // array of items {value: xx, text: xx}
  source: [],
  // attach event handler when value selection occurs,
  onChange: null,
  // 'infinite' - infinite scroll, 'normal' - normal scroll, non-infinite
  type: 'infinite'
  // wheel size, the number of items in the wheel, must be set to a multiple of 4
  qty: 20,
  // sensitivity, coefficient of friction
  sensitivity: 1.5
  // current value
  value: null
});
```
Destroy with:

```javascript
const wheelPicker = new WheelPicker({
  elem: '#wheel-picker',
  source: source,
  onChange: (selected) => {}
});
wheelPicker.destroy();
```

### Browser support

Wpicker should run on all modern browsers.

### Dependencies

None :)

### Development

Want to contribute? Great!

Wpicker uses Gulp + Webpack for fast developing.

1.  Install the [node.js](https://nodejs.org)
2.  Clone the project or [download](https://github.com/rumaxoft/wheeel-picker/archive/master.zip) the file
    ```sh
    git clone git@github.com:rumaxoft/wheel-picker.git --depth 1 my-project
    ```
3.  Go to project folder and run
    ```bash
    npm run setup
    ```
4.  Start dev server
    ```bash
    gulp dev
    ```
5.  In browser open page with address [`http://localhost:3000/`](http://localhost:3000/)

### License

Copyright (c) 2020 Maksim Rudenko

Licensed under the MIT license.

It's all yours.
