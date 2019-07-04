module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            },
            {
                test: /.(jpg|jpeg|png|svg)$/,
                use: ['url-loader']
            }
        ]
    },
    devServer: {
        historyApiFallback: true
    }
};