'use strict';

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const pug = require("gulp-pug");
const stylusOrigin = require('stylus');
const stylus = require('gulp-stylus');
const resolver = require('stylus').resolver;
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano');
const del = require('del');
const debug = require('gulp-debug');
const changed = require('gulp-changed')
const logger = require("gulplog");
const named = require('vinyl-named');
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const path = require('path');
const compiler = require('webpack');
const notify = require('gulp-notify');

const CWD = process.cwd();

const NODE_ENV = process.env.NODE_ENV ? "production" : "development";
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

gulp.task('html', function() {

  return gulp
		.src(["**/*.pug", "!**/_*.pug"], { cwd: "src/pages" })
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'HTML',
				message: err.message
			}))
    }))
		.pipe(pug())
		.pipe(gulp.dest("dest"));
});

gulp.task('styles', function() {

  function stylusFileExists() {
    return function(style) {
      style.define("file-exists", function(path) {
        return !!stylusOrigin.utils.lookup(path.string, this.paths);
      });
    };
  }

  return gulp.src(["*.styl", "!_*.styl"], { cwd: "src/static/styles" })
      .pipe(plumber({
        errorHandler: notify.onError(err => ({
          title: 'Styles',
          message: err.message
        }))
      }))
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(stylus({
        define: {
          url: resolver()
        },
        use: [stylusFileExists(),
              ],
        "include css": true,
        include: [path.join(process.cwd(), "node_modules")],
			}))
      .pipe(postcss())
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(gulpIf(!isDevelopment, cssnano()))
      .pipe(gulp.dest('dest/assets/stylesheets'));

});

gulp.task('clean', function() {
  return del('dest');
});

gulp.task('assets', function() {
  return gulp.src('src/static/assets/**', {since: gulp.lastRun('assets')})
      .pipe(debug({title: 'assets'}))
      .pipe(changed("dest/assets"))
      .pipe(gulp.dest('dest/assets'));
});

gulp.task('js', function(callback) {

  let firstBuildReady = false;

  function done(err, stats) {
    firstBuildReady = true;

    if (err) { // hard error, see https://webpack.github.io/docs/node.js-api.html#error-handling
      return;  // emit('error', err) in webpack-stream
    }

    logger[stats.hasErrors() ? 'error' : 'info'](stats.toString({
      colors: true
    }));
  }

  let options = {
    mode: NODE_ENV,
    output: {
      publicPath: "/assets/javascripts/"
    },
    watch:   isDevelopment,
    devtool: isDevelopment ? 'cheap-module-inline-source-map' : false,
    module:  {
      noParse: /\/node_modules\/(jquery)/,
      rules: [
        {
          test:    /\.js$/,
          exclude: /node_modules/,
          include: path.join(__dirname, "src"),
          use: {
            loader:  'babel-loader',
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: 'usage',
                    debug: false,
                    corejs: 3,
                  }
                ]
              ]
            }
          }
        }
      ]
    },
    externals: {
        jquery: 'jQuery'
    },
    plugins: [
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(NODE_ENV)
      })
    ]
  };

  return gulp
    .src(["*.js", "!_*.js"], { cwd: "src/static/scripts" })
    .pipe(debug())
    .pipe(plumber({
      errorHandler: notify.onError(err => ({
        title:   'Js',
        message: err.message
      }))
    }))
    .pipe(named())
    .pipe(webpackStream(options, compiler, done))
    .pipe(gulpIf(!isDevelopment, uglify()))
    .pipe(debug())
    .pipe(gulp.dest('dest/assets/javascripts'))
    .on('data', function() {
      if (firstBuildReady) {
        callback();
      }
    });
});

gulp.task('serve', function() {
  browserSync.init({
    server: 'dest'
  });

  browserSync.watch('dest/**/*.*').on('change', browserSync.reload);
});

gulp.task('watch', function() {
  gulp.watch('src/**/**/*.styl', gulp.series('styles'));
  gulp.watch('src/static/assets/**/*.*', gulp.series('assets'));
  gulp.watch('src/**/*.pug', gulp.series('html'));
  gulp.watch('src/static/scripts/**/*.js', gulp.series('js'));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles', 'assets', 'js'),
    'html'
    )
);

gulp.task('dev',
    gulp.series('build', gulp.parallel('watch', 'serve'))
);
