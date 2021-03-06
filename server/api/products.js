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
const PAGE_URL = 'http://localhost:1337';
export default resource({

    id: 'product',

    index(req, res) {
        let limit = req.query.limit ? req.query.limit : 10;
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
                return Promise.all(promises).then(() => {
                    return generator.generate('views/catalog.ejs', {
                        products: prods,
                        options: {
                            pageURL : PAGE_URL
                        }
                    });
                })
                .then((data) => {
                    res.json(prods);
                })
                .catch(err=>{
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
            let promises = [];
            promises.push(p.prepareAssociations());
            return Promise.all(promises).then(() => {
                    return generator.generate('views/product.ejs', {
                        product: p,
                        options: {
                            pageURL : PAGE_URL
                        }
                    });
                })
                .then((data) => {
                    res.json(p);
                })
                .catch(err=>{
                    res.status(404).json({status: 404, message: err});
                });
        }).catch(function(errors) {
            console.log(errors);
            res.status(404).json({status: 404, message: 'Product not found'});
        });
    }
});
