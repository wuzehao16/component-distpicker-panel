var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var conf = {
  entry: {
    example: './example/index.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  amd: {
    jQuery: true
  },
  resolve: {
    root: path.resolve('src'),
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.async\.less$/,
        loader: 'style!css!less'
      },
      {
        test: /\.less$/,
        exclude: /async/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
      },
      {
        test: /\.tpl/,
        loader: 'underscore-template-loader'
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'url?limit=1024&name=img/[name].[hash:8].[ext]'
      },
      {
        test: /\.woff(2)?|\.ttf|\.eot|\.svg/i,
        loader: "url?limit=10000&name=fonts/[hash:8].[ext]"
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("[name].css"),
    new webpack.ProvidePlugin({
      '$': 'jquery',
      '_': 'underscore'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './example/index.html'
    }),
  ]
};

module.exports = conf;
