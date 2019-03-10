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
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          }
        }
      ]
    }]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'src/images',
        to: 'images',
      }
    ]),
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
