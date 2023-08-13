const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: "handlebars-loader",
        options: {
          helperDirs: path.resolve(__dirname, "./src/js/handlebars-helpers")
        }
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      }]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
          {
            from: "src/images",
            to: "images",
          },
          {
            from: "src/js/direct",
            to: "js",
          },
        ]
      }),
    new HtmlWebpackPlugin({
      hash: true,
      template: '!!handlebars-loader?helperDirs=' + path.resolve(__dirname, 'src/js/handlebars-helpers') + '!src/templates/index.hbs'
    })
  ],
  resolve: {
    alias: {
      handlebars: 'handlebars/dist/handlebars.min.js'
    }
  }
};
