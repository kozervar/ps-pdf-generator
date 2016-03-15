/**
 * Created by kozervar on 2016-03-15.
 */
'use strict';
import request from 'request-promise';
import qs from 'qs';
import xml2js from 'xml2js';
import Promise from 'bluebird';

let parseString = Promise.promisify(xml2js.parseString);

class PrestashopWS {
    constructor(shopURL, key, options = {}) {
        if (!shopURL) {
            throw new Error('Shop URL required');
        }
        if (!key) {
            throw new Error('API key required');
        }
        this.shopURL = shopURL;
        this.key = key;
        this.options = options;
    }
    stringify(obj) {
        return qs.stringify(obj);
    }
    resource(resource = '') {
        return /^https?/.test(resource) ? resource : `${this.shopURL}/api/${resource}/`;
    }
    executeRequest(method, url, options = {}) {
        console.log(`Requesting[${method}] ${url} with options ${JSON.stringify(options)}`);
        let ops = {
            method: method,
            uri: url
        };
        return request(ops);
    }
    parse(response) {
        if(this.options.raw) {
            return response;
        }
        return parseString(response, {
            explicitArray: false,
            trim: true
        });
    }
    get(resource, options = {}) {
        let url = this.resource(resource);
        if(options.id) {
            url += options.id;
            delete options.id;
        }
        if(!options.ws_key) {
            options.ws_key = this.key;
        }
        let query = this.stringify(options);
        if(query.length) {
            url += `?${query}`;
        }
        return this.executeRequest('get', url, options).then(response => this.parse(response));
    }
}

export default PrestashopWS;