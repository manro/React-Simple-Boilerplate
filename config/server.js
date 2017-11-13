const express = require('express');
const path = require('path');
const debug = require('debug');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const history = require('connect-history-api-fallback');

const webpackConfig = require('./webpack.config.js');

const helper = require('./helper');

if (helper.TARGET === 'development') {
    
    const app = express();
    
    app.use(history({
        htmlAcceptHeaders: ['text/html'/*, 'application/xhtml+xml'*/],
    }));
    
    // Apply gzip compression
    app.use(compression());
    
    //Parse
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    
    const compiler = webpack(webpackConfig);
    
    console.log('Enabling webpack dev middleware');
    
    const webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
        publicPath: '/',
        //publicPath: webpackConfig.output.publicPath,
        contentBase: helper.PATHS.src,
        hot: true,
        quiet: false,
        noInfo: false,
        lazy: false,
        stats: helper.STATS
    });
    app.use(webpackDevMiddlewareInstance);
    
    
    console.log('Enabling webpack hot middleware');
    
    const webpackHotMiddlewareInstance = webpackHotMiddleware(compiler, {
        path: '/__webpack_hmr',
        log: console.log
    });
    app.use(webpackHotMiddlewareInstance);
    
   
    app.listen(helper.ENV.port);
    
    console.log(`Server is now running at http://${helper.ENV.host}:${helper.ENV.port}`);
}


