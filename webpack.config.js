const path = require('path');
const fs = require("fs-extra");
const glob = require("glob");
const frontMatter = require("front-matter");

const { format, parseISO } = require("date-fns");
const { enGB } = require("date-fns/locale");

const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();
const BLOG_DIR = path.resolve(__dirname, "src/content/blog");

const handlebarsLoaderOptions = {
  helperDirs: [path.resolve(__dirname, "src/js/handlebars-helpers")],
  precompileOptions: {
    knownHelpersOnly: true,
  }
};

const blogPosts = glob.sync(`${BLOG_DIR}/*.md`).map((file) => {
  const content = fs.readFileSync(file, "utf-8");
  const { attributes, body } = frontMatter(content);

  // Ensure a valid date and format it before passing to Handlebars
  let formattedDate = "Unknown Date";
  if (attributes.date) {
      try {
          const parsedDate = parseISO(attributes.date);
          formattedDate = format(parsedDate, "do MMMM yyyy", { locale: enGB });
      } catch (err) {
          console.error(`Error formatting date for ${file}:`, err);
      }
  }

  return {
      title: attributes.title,
      author: attributes.author || "Brendan Devenney",
      date: formattedDate,
      description: attributes.description,
      slug: path.basename(file, ".md"),
      content: md.render(body),
  };
});

const blogPages = blogPosts.map((post) => {
  return new HtmlWebpackPlugin({
      filename: `blog/${post.slug}.html`,
      template: "src/templates/blog-post.hbs",
      inject: false,
      templateParameters: post,
  });
});

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
        options: handlebarsLoaderOptions,
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
            from: "src/assets",
            to: "assets",
          },
          {
            from: "src/js/direct",
            to: "js",
          },
          {
            from: "node_modules/prismjs/themes/prism.css",
            to: "css/prism.css"
          },
          {
            from: "node_modules/prismjs/themes/prism-tomorrow.css",
            to: "css/prism-tomorrow.css"
          },
        ]
      }),
    new HtmlWebpackPlugin({
        hash: true,
        template: "src/templates/index.hbs",  // Remove query string loader
        templateParameters: {},
    }),
    ...blogPages, // Generates blog post pages dynamically
    new HtmlWebpackPlugin({
      filename: "blog/index.html",
      template: "src/templates/blog-index.hbs",
      inject: false,
      templateParameters: {
        blogPosts: blogPosts,
      },
    }),
  ],
  resolve: {
    alias: {
      handlebars: 'handlebars/dist/handlebars.min.js'
    }
  }
};
