/* global _, $ */
'use strict';

$(document).ready(() => {
    const xhrDefaults = {
        'contentType': 'application/json',
        'data': {
            'field1': 'val1',
            'field2': 'val2',
            'field3': ['val3-1', 'val3-2'],
            'field4': {
                'field4-1': 'val4-1',
                'field4-2': 'val4-2',
                'field4-3': 'val4-3'
            }
        },
        'dataType': 'json',
        'method': 'POST'
    };

    const xhrOptions = {
        'same-origin': {
            'url': 'http://localhost:3000/'
        },
        'cors-not-enabled': {
            'url': 'http://localhost:3001/cors-not-enabled'
        },
        'o1-not-allowed': {
            'url': 'http://localhost:3001/o1-not-allowed'
        },
        'o1-allowed': {
            'url': 'http://localhost:3001/o1-allowed'
        },
        'non-standard-headers': {
            'url': 'http://localhost:3001/non-standard-headers'
        },
        'credentials-disallowed': {
            'url': 'http://localhost:3001/credentials-disallowed',
            'xhrFields': {
                'withCredentials': true
            }
        },
        'credentials-allowed': {
            'url': 'http://localhost:3001/credentials-allowed',
            'xhrFields': {
                'withCredentials': true
            }
        },
        'basic-auth-header-valid': {
            'url': 'http://localhost:3001/basic-auth-header',
            'xhrFields': {
                'withCredentials': true
            },
            'headers': {
                'Authorization': 'Basic c29tZXVzZXI6c29tZXBhc3M='
            }
        },
        'basic-auth-header-invalid': {
            'url': 'http://localhost:3001/basic-auth-header',
            'xhrFields': {
                'withCredentials': true
            },
            'headers': {
                'Authorization': 'Basic aW52YWxpZHVzZXI6aW52YWxpZHBhc3M='
            }
        },
        'basic-auth-header-missing': {
            'url': 'http://localhost:3001/basic-auth-header-missing',
            'xhrFields': {
                'withCredentials': true
            }
        }
    };

    const displayCodeBlock = ($el) => {
        const opts = _.extend({}, xhrDefaults, xhrOptions[$el.val()]);
        $('#xhr-code-block').html(JSON.stringify(opts, null, 4));
        if ($el.val() === 'same-origin') {
            $('#cors-code-block').html('n/a');
        } else {
            const val = $el.val().replace(/^(.+)-(valid|invalid)$/, "$1");
            $.ajax({
                'url': `http://localhost:3001/${ val }`,
                'method': 'GET'
            })
                .done((data) => {
                    $('#cors-code-block').html(JSON.stringify(data, null, 4));
                });
        }
    };

    const displayResultBlock = (data, status, xhr) => {
        $('#response-data-block').html(JSON.stringify(data, null, 4));
        $('#response-status').html(status);
        $('#response-xhr-block').html(JSON.stringify(xhr, null, 4));
    };

    $('input').on('click', (event) => {
        displayCodeBlock($(event.currentTarget));
    });

    $('#send-request').on('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const opts = _.extend(
            {},
            xhrDefaults,
            xhrOptions[$('input:checked').val()],
            {'data': JSON.stringify(xhrDefaults.data)}
        );
        opts.url = 'http://localhost:3002/me-not-here';
        $('#response-data-block, #response-status, #response-xhr-block').html('');
        $.ajax(opts)
            .done((data, status, xhr) => {
                displayResultBlock(data, status, xhr);
            })
            .fail((xhr, status, error) => {
                displayResultBlock(error, status, xhr);

                $.ajax({
                    'url': 'http://localhost:3002/',
                    'method': 'POST',
                    'data': JSON.stringify({
                        'hostname': 'localhost',
                        'port': '3002',
                        'path': '/me-not-here',
                        'data': opts.data,
                        'method': opts.method
                    }),
                    'dataType': 'json',
                    'contentType': 'application/json'
                });
            })
            .always(() => {
                $('#page-tabs a[href="#response-content"]').tab('show');
            });
    });

    displayCodeBlock($('input:checked'));
});
