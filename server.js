/* global __dirname, require */
'use strict';

const path = require('path');
const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const serveStatic = require('serve-static');
const http = require('http');
const simpleRequest = require('request');

const slides = express();
const slidesServer = require('http').createServer(slides);
const slidesIo = require('socket.io')(slidesServer);

slides.use('/', serveStatic(path.join(__dirname, 'slides')))
    .use(favicon(path.join(__dirname, 'favicon.png')));

slidesServer.listen(8000, () => {
    console.log('Slide deck running on port 8000');
});

const app1 = express();
const app2 = express();
const app3 = express();

app1.use('/bower', serveStatic(path.join(__dirname, 'bower_components')))
    .use('/static', serveStatic(path.join(__dirname, 'demos/static')))
    .use(favicon(path.join(__dirname, 'favicon.png')));

app2.use(favicon(path.join(__dirname, 'favicon.png')));

const corsOpts = {
    'cors-not-enabled': {},
    'o1-not-allowed': {
        'origin': 'http://localhost:3002',
        'methods': ['GET', 'POST'],
        'allowedHeaders': ['Content-Type']
    },
    'o1-allowed': {
        'origin': 'http://localhost:3000',
        'methods': ['GET', 'POST'],
        'allowedHeaders': ['Content-Type']
    },
    'non-standard-headers': {
        'origin': 'http://localhost:3000',
        'methods': ['GET', 'POST'],
        'allowedHeaders': ['Content-Type']
    },
    'credentials-disallowed': {
        'origin': 'http://localhost:3000',
        'methods': ['GET', 'POST'],
        'allowedHeaders': ['Content-Type'],
        'credentials': false
    },
    'credentials-allowed': {
        'origin': 'http://localhost:3000',
        'methods': ['GET', 'POST'],
        'allowedHeaders': ['Content-Type'],
        'credentials': true
    },
    'basic-auth-header': {
        'origin': 'http://localhost:3000',
        'methods': ['GET', 'POST'],
        'allowedHeaders': ['Content-Type', 'Authorization'],
        'credentials': true
    },
    'basic-auth-header-missing': {
        'origin': 'http://localhost:3000',
        'methods': ['GET', 'POST'],
        'allowedHeaders': ['Content-Type', 'Authorization'],
        'credentials': true
    }
};

Object.keys(corsOpts).forEach((endpoint) => {
    app2.options(`/${ endpoint }`, cors(corsOpts[endpoint]));

    app2.get(`/${ endpoint }`, cors(), (req, res) => {
        res.json(corsOpts[endpoint]);
    });

    let middleware = [
        cors(corsOpts[endpoint]),
        bodyParser.json()
    ];

    if (endpoint === 'cors-not-enabled') {
        middleware = [bodyParser.json()];
    } else if (endpoint === 'basic-auth-header' || endpoint === 'basic-auth-header-missing') {
        middleware = [
            cors(corsOpts[endpoint]),
            basicAuth({'users': {'someuser': 'somepass'}}),
            bodyParser.json()
        ];
    }

    app2.post(`/${ endpoint }`, middleware, (req, res) => {
        res.json({
            'endpoint': `http://localhost:3000/${ endpoint }`,
            'posted-data': req.body
        });
    });
});

app1.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'demos/index.html'));
});

app1.post('/', bodyParser.json(), (req, res) => {
    res.json({
        'endpoint': 'http://localhost:3000/',
        'posted-data': req.body
    });
});

app1.listen(3000, () => {
    console.log('Demo front end listening on port 3000')
});

app2.listen(3001, () => {
    console.log('Demo API listening on port 3001')
});

app3.post('/me-not-here', [cors({
    'origin': 'http://localhost:9001',
    'methods': ['GET', 'POST'],
    'allowedHeaders': ['Content-Type']
}), bodyParser.json()], () => {
    //foo
});

app3.head('/me-not-here', [cors({
    'origin': 'http://localhost:9001',
    'methods': ['GET', 'POST'],
    'allowedHeaders': ['Content-Type']
}), bodyParser.json()], () => {
    //foo
});

app3.options('/', cors({
    'origin': 'http://localhost:3000',
    'methods': ['GET', 'POST'],
    'allowedHeaders': ['Content-Type']
}));

app3.post('/', [cors({
    'origin': 'http://localhost:3000',
    'methods': ['GET', 'POST'],
    'allowedHeaders': ['Content-Type']
}), bodyParser.json()], (req, res) => {
    let resData = {};

    const data = req.body;
    const reqParams = {
        'uri': `http://${data.hostname}:${data.port}${data.path}`,
        'headers': {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.8',
            'Connection': 'keep-alive',
            'Content-Length': '60',
            'Content-Type': 'application/json',
            'Host': 'localhost:3002',
            'Origin': 'http://localhost:3000',
            'Referer': 'http://localhost:3000/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36'
        }
    };

    // const p1 = new Promise((resolve) => {
    //     console.log('p1');
    //     const params = reqParams;
    //     params.method = 'OPTIONS';
    //     simpleRequest(params)
    //         .on('error', (err) => {
    //             resData.options = err;
    //             console.log('p1 failed');
    //             resolve();
    //         })
    //         .on('response', (response) => {
    //             resData.options = {
    //                 'status': response.statusCode,
    //                 'headers': response.headers,
    //                 'response': response
    //             };
    //             console.log('p1 resolved');
    //             resolve();
    //         });
    // });
    //
    const p2 = new Promise((resolve) => {
        console.log('p2');
        const params = reqParams;
        params.method = 'HEAD';
        simpleRequest(params)
            .on('error', (err) => {
                resData.head = err;
                console.log('p2 failed');
                resolve();
            })
            .on('response', (response) => {
                resData.get = {
                    'status': response.statusCode,
                    'headers': response.headers,
                    'response': response
                };
                console.log('p2 resolved');
                resolve();
            });
    });

    const p3 = new Promise((resolve) => {
        console.log('p3');
        const params = reqParams;
        params.method = data.method;
        simpleRequest(params)
            .on('error', (err) => {
                resData[data.method] = err;
                console.log('p3 failed');
                resolve();
            })
            .on('response', (response) => {
                resData[data.method] = {
                    'status': response.statusCode,
                    'headers': response.headers,
                    'response': response
                };
                console.log('p3 resolved');
                resolve();
            });
    });

    Promise.all([p2, p3]).then(() => {
        res.json(resData);
    });
});

app3.listen(3002, () => {
    console.log('woot');
});
