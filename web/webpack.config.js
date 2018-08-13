module.exports = {
  // mode: "development",
  mode: "production",
  entry: "./main.js",
  output: {
    filename: "bundle.js"
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['env']
      }
    }]
  }
};