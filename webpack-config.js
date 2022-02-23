const path = require('path');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    entry: "./src/index.jsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "public")
    },
  
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([ 
            {
                from: "src",
                to: "",
                ignore: [
                          "*.jsx", "*.js", "*.json", "*.txt", "**/css/**", "**/components/**", "**/design_elements/**", "**/react-redux-store/**"
                ]
            }
        ])
    ],
    
    module: {
        rules: [ 
            {
                test: /\.jsx$/, 
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    }
};
