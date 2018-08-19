module.exports = {
  // mode: "development",
  mode: "production",
  entry: "./main.js",
  output: {
    path: __dirname + '/src',
    filename: "bundle.js"
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        "presets": ['env']
      }
    }]
  
  }
};