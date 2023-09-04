/** @type {import('next').NextConfig} */
const path = require('path');
var webpack = require('webpack');

module.exports = {
  webpack: (config) => {
    // config.mode = "development" || "production";
    // config.plugins.push(new webpack.DllReferencePlugin({
    //   scope: "react",
    //   manifest: require('./dist/react-manifest.json'),
    //   extensions: ['.js']
    // }));
    // config.externals = {
    //   react: 'React'
    // };
    
    return config;
  }

  // experimental: {
  //   outputFileTracingRoot: path.join(__dirname, './app'),
  //   outputFileTracingIncludes: {
  //     'react': ['./node_modules/react/**/*']
  //   }
  // },
  // output: 'standalone'
}