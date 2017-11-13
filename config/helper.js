const path = require('path');

const TARGET = process.env.npm_lifecycle_event || 'development';
console.log('mode: ', TARGET);

const PATHS = {
    root: path.join(__dirname, '../'),
    src: path.join(__dirname, '../src'),
    dist: path.join(__dirname, '../dist'),
    styles: path.join(__dirname, '../src/styles/styles.less'),
    static: path.join(__dirname, '../static')
};


const ENV = {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3010
};

const STATS = {
    colors: true,
    chunks : false,
    chunkModules : false,
    
    /*hash: false,
    version: false,
    timings: false,
    assets: false,*/
    modules: false,
    /*reasons: false,
    children: false,
    source: false,
    errors: false,
    errorDetails: false,
    warnings: false,
    publicPath: false*/
};

const BABEL_DEV_RC = {
    "cacheDirectory": true,
    "presets": [
        "es2015",
        "react",
        "stage-0"
    ],
    "env": {
        "start": {
            "presets": [
                "react-hmre"
            ]
        }
    },
    "plugins":  [
        "react-hot-loader/babel",
        "add-module-exports",
    
        //Saga generators support
        ["transform-runtime", {
            "polyfill": false,
            "regenerator": true
        }]
    ]
};

const BABEL_BUILD_RC = {
    "presets": [
        "es2015",
        "react",
        "stage-0"
    ],
    "plugins":  [
        "add-module-exports",
    
        //Saga generators support
        ["transform-runtime", {
            "polyfill": false,
            "regenerator": true
        }]
    ]
};

module.exports = {
    PATHS,
    ENV,
    TARGET,
    STATS,
    BABEL_DEV_RC,
    BABEL_BUILD_RC,
};