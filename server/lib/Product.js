/**
 * Created by kozervar on 2016-03-15.
 */
'use strict';
import PrestashopWS from '../lib/prestashopws';
import psWSconfig from '../config/PrestashopWS.config';
import Promise from 'bluebird';
import ProductFeatureRegistry from './ProductFeatureRegistry';

let prestashopWS = new PrestashopWS(psWSconfig.shopURL, psWSconfig.key, {debug: true});

let _product = null;

let productFeatureRegistry = new ProductFeatureRegistry();

class Product {
    constructor(r) {
        _product = r;

        this.id = r.id;
        this.reference = r.reference;
        this.price = parseFloat(r.price);

        this.category = [];
        this.quantity = null;

        if (r.id_category_default
            && r.id_category_default.$
            && r.id_category_default.$['xlink:href'])
            this.$id_category_default = r.id_category_default.$['xlink:href'];

        if (r.id_default_image
            && r.id_default_image.$
            && r.id_default_image.$['xlink:href']) {
            this.image_url = r.id_default_image.$['xlink:href'];
            this.image_url = 'http://' + psWSconfig.key + '@' + this.image_url.substr(7, this.image_url.length);
            this.image_url += '/medium_default';
        }

        if (r.name
            && r.name.language
            && r.name.language.length > 0) {
            this.name = [];
            r.name.language.forEach(e => {
                this.name.push({
                    id_language: e.$.id,
                    name: e._
                });
            });
        }
        if (r.associations) {
            let assoc = r.associations;
            if (assoc.stock_availables
                && assoc.stock_availables.stock_available
                && assoc.stock_availables.stock_available.$
                && assoc.stock_availables.stock_available.$['xlink:href']) {
                this.$stock_available = assoc.stock_availables.stock_available.$['xlink:href'];
            }
            //if(assoc.product_features && Array.isArray(assoc.product_features.product_feature)) {
            //    this.$product_features = assoc.product_features.product_feature;
            //}
        }

    }

    prepareAssociations() {
        return new Promise((resolve, reject) => {
            var promises = [];
            for (let propertyName in this) {
                if (propertyName.startsWith('$')) {
                    let p = propertyName.split('$');
                    let pName = p[1];

                    let options = {};

                    var prom = prestashopWS.get(this[propertyName], options).then(response => {
                        if (pName == 'stock_available') {
                            this.quantity =
                                response.prestashop.stock_available.quantity;
                        }
                        if (pName == 'id_category_default') {
                            let names =
                                response.prestashop.category.name;
                            this.category = [];
                            names.language.forEach(e => {
                                this.category.push({
                                    id_language: e.$.id,
                                    name: e._
                                });
                            });
                        }
                        if (pName == 'product_features') {
                            //productFeatureRegistry.check(this.$product_features);
                        }
                    }).catch(errors => {
                        console.error('Error resolving associations - ', errors);
                        throw errors;
                    });
                    promises.push(prom);
                }
            }
            Promise.all(promises).then(() => resolve()).catch(err=>reject(err));
        });
    }
}
export default Product;