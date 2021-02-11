const path = require('path');
const webpack = require('webpack');
const pkg = require('../package.json');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const constantPack = new webpack.DefinePlugin({
  QUILL_VERSION: JSON.stringify(pkg.version),
});

const source = [
  'quill.js',
  'core.js',
  'blots',
  'core',
  'formats',
  'modules',
  'test',
  'themes',
  'ui',
].map(file => {
  return path.resolve(__dirname, '..', file);
});

const jsRules = {
  test: /\.js$/,
  include: source,
  use: [
    {
      loader: 'babel-loader',
      options: {
        presets: [
          [
            '@babel/env',
            {
              targets: {
                browsers: [
                  'last 2 Chrome major versions',
                  'last 2 Firefox major versions',
                  'last 2 Safari major versions',
                  'last 2 Edge major versions',
                  'last 2 iOS major versions',
                  'last 2 ChromeAndroid major versions',
                ],
              },
            },
          ],
        ],
      },
    },
  ],
};

const svgRules = {
  test: /\.svg$/,
  include: [path.resolve(__dirname, '../assets/icons')],
  use: [
    {
      loader: 'html-loader',
      options: {
        minimize: true,
      },
    },
  ],
};

const htmlRules = {
  test: /\.html$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
      },
    },
  ],
};

const stylRules = {
  test: /\.styl$/,
  include: [path.resolve(__dirname, '../assets')],
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
};

const tsRules = {
  test: /\.ts$/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        compilerOptions: {
          declaration: false,
          module: 'es6',
          sourceMap: true,
          target: 'es6',
        },
        transpileOnly: true,
      },
    },
  ],
};

const cssRules = {
  test: /\.css$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: '',
      },
    },
    {
      loader: 'css-loader',
    },
  ],
};

const fontRules = {
  test: /\.(woff(2)?|ttf)$/,
  use: [
    {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
        outputPath: 'fonts/',
      },
    },
  ],
};

const baseConfig = {
  mode: 'development',
  context: path.resolve(__dirname, '..'),
  entry: {
    'quill.js': './quill.js',
    'html': './assets/standalone.html',
    'quill.snow': './assets/snow.styl',
    'unit.js': './test/unit.js',
    'katex.min': './node_modules/katex/dist/katex.min.css',
  },
  output: {
    filename: '[name]',
    library: 'Quill',
    libraryExport: 'default',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, '../dist/'),
  },
  resolve: {
    alias: {
      parchment: path.resolve(
        __dirname,
        '../node_modules/parchment/src/parchment',
      ),
    },
    extensions: ['.js', '.styl', '.ts'],
  },
  module: {
    rules: [jsRules, stylRules, svgRules, htmlRules, tsRules, cssRules, fontRules],
    noParse: [
      /\/node_modules\/clone\/clone\.js$/,
      /\/node_modules\/eventemitter3\/index\.js$/,
      /\/node_modules\/extend\/index\.js$/,
    ],
  },
  plugins: [
    constantPack,
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '../dist'),
    hot: false,
    host: '0.0.0.0',
    port: process.env.npm_package_config_ports_webpack,
    stats: 'minimal',
    disableHostCheck: true,
  },
};

module.exports = env => {
  if (env && env.minimize) {
    const { devServer, ...prodConfig } = baseConfig;
    return {
      ...prodConfig,
      mode: 'production',
      entry: {
        'quill.min.js': './quill.js',
        'quill.snow': './assets/snow.styl',
        'katex.min': './node_modules/katex/dist/katex.min.css',
      },
      devtool: 'source-map',
    };
  }
  if (env && env.coverage) {
    baseConfig.module.rules[0].use[0].options.plugins = ['istanbul'];
    return baseConfig;
  }
  return baseConfig;
};
