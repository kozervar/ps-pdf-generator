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
const PAGE_URL = 'http://localhost:8080';
export default resource({

    id: 'fakeproduct',

    index(req, res) {
        fs.readFile('views/products.json', 'utf8', function (err,data) {
            if (err) {
                res.status(404).json({status: 404, message: err});
            }
            let prods = JSON.parse(data);
            generator.generate('views/catalog.ejs', {
                products: prods,
                options: {
                    pageURL : PAGE_URL
                }
            })
                .then((data) => {
                    res.json(prods);
                })
                .catch(err=>{
                    res.status(404).json({status: 404, message: err});
                });
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
