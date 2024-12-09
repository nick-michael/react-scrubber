const HtmlWebPackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );

module.exports = {
    entry: "./src/index.tsx",
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    devtool: "source-map",
    resolve: {
        extensions: [".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    mode: 'development',
    devServer: {
        hot: true,
        port: 3000,
    },
    plugins: [
      new HtmlWebPackPlugin({
         template: path.resolve( __dirname, 'index.html' ),
         filename: 'index.html'
      })
   ]
};