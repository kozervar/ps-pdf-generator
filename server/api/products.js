/**
 * Created by kozervar on 2016-03-15.
 */

'use strict';
import resource from 'resource-router-middleware';
import products from './../models/products';
import fs from 'fs';
import PrestashopWS from '../lib/prestashopws';
import Product from '../lib/Product';
import psWSconfig from '../config/PrestashopWS.config';
import Promise from 'bluebird';
import PDFGenerator from '../lib/PDFGenerator'

let prestashopWS = new PrestashopWS(psWSconfig.shopURL, psWSconfig.key, { debug: true });
let generator = new PDFGenerator();

export default resource({

    id: 'product',

    //load(req, id, callback) {
    //    console.log('load');
    //    callback({status: 404, message: 'Product not found ' + id}, 'Product not found ' + id);
    //},

    index(req, res) {
        let limit = req.query.limit ? req.query.limit : 5;
        prestashopWS.get('products', {
            'display': 'full',
            'limit': limit,
            'sort': '[id_ASC]',
            'price[price][use_tax]': 1
        }).then(function(response) {
            if(!response.prestashop.products.product) {
                console.log('No products found!');
                res.status(404).json({status: 404, message: 'Product not found'});
                return;
            }
            if(!response.prestashop.products.product.length) {
                console.log('Product received');
                var prod = response.prestashop.products.product;
                var p = new Product(prod);
                p.prepareAssociations().then(() => {
                    res.json([p]);
                });
                return;
            } else {
                console.log(response.prestashop.products.product.length + ' Products received');
                let promises = [];
                let prods = [];
                response.prestashop.products.product.forEach(e => {
                    var p = new Product(e);
                    let promise = p.prepareAssociations().then(() => {
                        prods.push(p);
                    });
                    promises.push(promise);
                });
                return Promise.all(promises).then(() => res.json(prods)).catch(err=>{
                    res.status(404).json({status: 404, message: err});
                });
            }
        }).catch(function(errors) {
            console.log(errors);
            res.status(404).json({status: 404, message: 'Product not found'});
        });
    },

    read(req, res) {
        prestashopWS.get('products', {
            'id': req.params.product,
            'price[price][use_tax]': 1
        }).then(function(response) {
            if(!response.prestashop.product) {
                console.log('No products found!');
                res.status(404).json({status: 404, message: 'Product not found'});
                return;
            }
            console.log('Product received');
            var prod = response.prestashop.product;
            var p = new Product(prod);
            p.prepareAssociations()
                .then(() => {
                    return generator.generate('views/product.ejs', p);
                })
                .then(data => res.json([p]));
        }).catch(function(errors) {
            console.log(errors);
            res.status(404).json({status: 404, message: 'Product not found'});
        });
    }
});
