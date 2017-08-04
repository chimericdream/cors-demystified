/* global __dirname, require */
'use strict';

const path = require('path');
const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const cors = require('cors');
const favicon = require('serve-favicon');
const serveStatic = require('serve-static');

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
