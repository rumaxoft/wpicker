const path = require('path');
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;

const NODE_ENV = process.env.NODE_ENV ? 'production' : 'development';
const isDevelopment = NODE_ENV === 'development';

exports.options = {
  mode: NODE_ENV,
  output: {
    library: 'wpicker',
    libraryTarget: 'umd',
    filename: 'wpicker.js',
  },
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
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
};
