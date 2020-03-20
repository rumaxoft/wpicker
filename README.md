# Wpicker


Wpicker is a light-weight, dependency free IOs-like ui-picker.
Demos and full documentation available on Github Pages: https://rumaxoft.github.io/wpicker/

### Quick start

Include wpicker.min.css:

```html
<link rel="stylesheet" href="wpicker.min.css">
or
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/wpicker@1/wpicker.min.css">
```

Include wpicker.min.js:

```html
<script src="wpicker.min.js"></script>
or
<script src="https://cdn.jsdelivr.net/npm/wpicker@1/wpicker.min.js"></script>
```

Example HTML:

```html
<div class="wpicker-container">
  <div id="wpicker">
  </div>
</div>
```

wpicker Initialization

```javascript
const source = [
    {value: 1, text: '1'},
    {value: 2, text: '2'},
    {value: 3, text: '3'},
    {value: 4, text: '4'},
    {value: 5, text: '5'}
]
new WheelPicker({
  elem: '#wpicker',
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
  elem: '#wpicker',
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
2.  Clone the project or [download](https://github.com/rumaxoft/wpicker/archive/master.zip) the file
    ```sh
    git clone git@github.com:rumaxoft/wpicker.git --depth 1 my-project
    ```
3.  Go to project folder and run
    ```bash
    npm run setup
    ```
4.  Start dev server with exaple
    ```bash
    npm run dev
    ```
5.  In browser open page with address [`http://localhost:3000/`](http://localhost:3000/)

6. Build wpicker in wpicker directory
  ```bash
    npm run build
    ```
7. Start dev server with site
  ```bash
    npm run site
    ```
8. Build site
  ```bash
    npm run site:build
    ```

### License

Copyright (c) 2020 Maksim Rudenko

Licensed under the MIT license.

It's all yours.
