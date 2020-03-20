'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const stylus = require('gulp-stylus');
const resolver = require('stylus').resolver;
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const postcss = require('gulp-postcss');
const cssnano = require('gulp-cssnano');
const del = require('del');
const debug = require('gulp-debug');
const changed = require('gulp-changed');
const logger = require('gulplog');
const named = require('vinyl-named');
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const path = require('path');
const compiler = require('webpack');
const notify = require('gulp-notify');
const argv = require('yargs').argv;
const rename = require('gulp-rename');

const NODE_ENV = process.env.NODE_ENV ? 'production' : 'development';
const isDevelopment =
  !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
const serveDir = argv.site? 'site' : 'example';
const isSite = argv.site? true : false;

gulp.task('html', function() {
  return gulp
      .src(['**/*.pug', '!**/_*.pug'], {cwd: `src/${serveDir}`})
      .pipe(
          plumber({
            errorHandler: notify.onError((err) => ({
              title: 'HTML',
              message: err.message,
            })),
          }),
      )
      .pipe(pug())
      .pipe(gulp.dest(serveDir));
});

gulp.task('styles', function() {
  return gulp
      .src(['*.styl', '!_*.styl'], {cwd: `src/${serveDir}/static/styles`})
      .pipe(
          plumber({
            errorHandler: notify.onError((err) => ({
              title: 'Styles',
              message: err.message,
            })),
          }),
      )
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(
          stylus({
            'define': {
              url: resolver(),
            },
            'include css': true,
            'include': [path.join(process.cwd(), 'node_modules')],
          }),
      )
      .pipe(postcss())
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(gulpIf(!isDevelopment, rename({suffix: '.min'})))
      .pipe(gulpIf(!isDevelopment, cssnano()))
      .pipe(gulp.dest(`${serveDir}/assets/stylesheets`));
});

gulp.task('wpicker:styles', function() {
  return gulp
      .src(['*.styl', '!_*.styl'], {cwd: `src/wpicker`})
      .pipe(
          plumber({
            errorHandler: notify.onError((err) => ({
              title: 'Styles',
              message: err.message,
            })),
          }),
      )
      .pipe(
          stylus({
            'define': {
              url: resolver(),
            },
            'include css': true,
            'include': [path.join(process.cwd(), 'node_modules')],
          }),
      )
      .pipe(postcss())
      .pipe(gulp.dest(`wpicker`))
      .pipe(cssnano())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest(`wpicker`));
});

gulp.task('clean', function() {
  if (isSite) {
    return del('site');
  } else {
    return del('example');
  }
});

gulp.task('wpicker:clean', function() {
  return del('wpicker');
});

gulp.task('assets', function() {
  return gulp
      .src(`src/${serveDir}/static/assets/**`, {since: gulp.lastRun('assets')})
      .pipe(debug({title: 'assets'}))
      .pipe(changed(`${serveDir}/assets`))
      .pipe(gulp.dest(`${serveDir}/assets`));
});

gulp.task('js', function(callback) {
  let firstBuildReady = false;

  // eslint-disable-next-line require-jsdoc
  function done(err, stats) {
    firstBuildReady = true;

    if (err) {
      // hard error, see https://webpack.github.io/docs/node.js-api.html#error-handling
      return; // emit('error', err) in webpack-stream
    }

    logger[stats.hasErrors() ? 'error' : 'info'](
        stats.toString({
          colors: true,
        }),
    );
  }

  const options = {
    mode: NODE_ENV,
    output: {
      publicPath: '/assets/javascripts/',
    },
    watch: isDevelopment,
    devtool: isDevelopment ? 'cheap-module-inline-source-map' : false,
    module: {
      noParse: /\/node_modules\/(jquery)/,
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          include: path.join(__dirname, 'src'),
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    debug: false,
                    corejs: 3,
                  },
                ],
              ],
            },
          },
        },
      ],
    },
    externals: {
      jquery: 'jQuery',
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      }),
    ],
  };

  return gulp
      .src(['*.js', '!_*.js'], {cwd: `src/${serveDir}/static/scripts`})
      .pipe(debug())
      .pipe(
          plumber({
            errorHandler: notify.onError((err) => ({
              title: 'Js',
              message: err.message,
            })),
          }),
      )
      .pipe(named())
      .pipe(webpackStream(options, compiler, done))
      .pipe(gulpIf(!isDevelopment, uglify()))
      .pipe(debug())
      .pipe(gulp.dest(`${serveDir}/assets/javascripts`))
      .on('data', function() {
        if (firstBuildReady) {
          callback();
        }
      });
});

gulp.task('wpicker:js', function(callback) {
  let firstBuildReady = false;

  // eslint-disable-next-line require-jsdoc
  function done(err, stats) {
    firstBuildReady = true;

    if (err) {
      // hard error, see https://webpack.github.io/docs/node.js-api.html#error-handling
      return; // emit('error', err) in webpack-stream
    }

    logger[stats.hasErrors() ? 'error' : 'info'](
        stats.toString({
          colors: true,
        }),
    );
  }

  const options = {
    mode: NODE_ENV,
    output: {
      publicPath: '/assets/javascripts/',
    },
    watch: isDevelopment,
    devtool: isDevelopment ? 'cheap-module-inline-source-map' : false,
    module: {
      noParse: /\/node_modules\/(jquery)/,
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          include: path.join(__dirname, 'src'),
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'usage',
                    debug: false,
                    corejs: 3,
                  },
                ],
              ],
            },
          },
        },
      ],
    },
    externals: {
      jquery: 'jQuery',
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      }),
    ],
  };

  return gulp
      .src(['*.js'], {cwd: 'src/wpicker'})
      .pipe(debug())
      .pipe(
          plumber({
            errorHandler: notify.onError((err) => ({
              title: 'Js',
              message: err.message,
            })),
          }),
      )
      .pipe(named())
      .pipe(webpackStream(options, compiler, done))
      .pipe(debug())
      .pipe(gulp.dest('wpicker'))
      .pipe(uglify())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('wpicker'))
      .on('data', function() {
        if (firstBuildReady) {
          callback();
        }
      });
});

gulp.task('serve', function() {
  browserSync.init({
    server: [serveDir],
    open: false,
  });

  browserSync.watch([`${serveDir}/**/*.*`])
      .on('change', browserSync.reload);
});

gulp.task('watch', function() {
  gulp.watch('src/**/**/*.styl', gulp.series('styles'));
  gulp.watch('src/static/assets/**/*.*', gulp.series('assets'));
  gulp.watch('src/**/*.pug', gulp.series('html'));
  gulp.watch('src/static/scripts/**/*.js', gulp.series('js'));
});

gulp.task(
    'build',
    gulp.series('clean', gulp.parallel('styles', 'assets', 'js'), 'html'),
);

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
