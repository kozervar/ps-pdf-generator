/**
 * Created by kozervar on 2016-03-24.
 */
'use strict';
import PrestashopWS from '../lib/prestashopws';
import psWSconfig from '../config/PrestashopWS.config';
import Promise from 'bluebird';

let prestashopWS = new PrestashopWS(psWSconfig.shopURL, psWSconfig.key, {debug: true});

class ProductFeature {
    constructor(request) {
        if (request) {
            this.url = request.$['xlink:href'];
            this.id = request.id;
            this.position = null;
            this.name = [];
        }
    }

    cloneWithValue(productFeatureValue) {
        let pf = new ProductFeature();
        pf.id = this.id;
        pf.position = this.position;
        pf.url = this.url;
        pf.name = JSON.parse(JSON.stringify(this.name));
        this.value = productFeatureValue;
        return pf;
    }

    resolve() {
        return new Promise((resolve, reject) => {
            if (this.name.length > 0) {
                return resolve(this);
            }
            console.log(JSON.stringify(this.url));
            prestashopWS.get(this.url, options).then(response => {
                if (response.prestashop) {
                    let pf = response.prestashop.product_feature;
                    this.position = pf.position;
                    if (pf.name
                        && pf.name.language
                        && pf.name.language.length > 0) {
                        r.name.language.forEach(e => {
                            this.name.push({
                                id_language: e.$.id,
                                name: e._
                            });
                        });
                    }
                    return resolve(this);
                }
            }).catch(errors => {
                console.error('Error resolving ProductFeature - ', errors);
                reject(errors);
            });
        });
    }
}

class ProductFeatureValue {
    constructor(requestProductFeature) {
        this.url = requestProductFeature.id_feature_value.$['xlink:href'];
        this.id = requestProductFeature.id_feature_value['_'];
        this.id_feature = requestProductFeature.id;
        this.custom = 0;
        this.value = [];
    }

    resolve() {
        return new Promise((resolve, reject) => {
            if (this.value.length > 0) {
                return resolve(this);
            }
            prestashopWS.get(this.value, options).then(response => {
                if (response.prestashop) {
                    let pf = response.prestashop.product_feature_value;
                    if (pf.value
                        && pf.value.language
                        && pf.value.language.length > 0) {
                        r.value.language.forEach(e => {
                            this.value.push({
                                id_language: e.$.id,
                                value: e._
                            });
                        });
                    }
                    return resolve(this);
                }
            }).catch(errors => {
                console.error('Error resolving ProductFeatureValue - ', errors);
                reject(errors);
            });
        });
    }
}

class ProductFeatureRegistry {
    constructor() {
        this.productFeatures = [];
    }

    check(featuresRequestList) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(featuresRequestList)) {
                console.log('Parameter should be an Array');
                return resolve();
            }
            let promises = [];

            for (var i = 0; i < featuresRequestList.length; i++) {
                var f = featuresRequestList[i];
                let pf = this.productFeatures.find(e => e.id == f.id);
                let productFeature = null;
                if (pf !== undefined) {
                    productFeature = pf;
                } else {
                    productFeature = new ProductFeature(f);
                    this.productFeatures.push(productFeature);
                }
                promises.push(productFeature.resolve());
            }
            Promise.all(promises).then(() => {
                return this.resolveValues(featuresRequestList);
            }).then((features) => {
                resolve(features);
            }).catch(err=>reject(err));
        });
    }

    resolveValues(featuresRequestList) {
        return new Promise((resolve, reject) => {
            let productFeatureValues = [];
            let valuesPromises = [];
            for (var i = 0; i < featuresRequestList.length; i++) {
                var f = featuresRequestList[i];
                let pfv = new ProductFeatureValue(f);
                productFeatureValues.push(pfv);
                valuesPromises.push(pfv.resolve());
            }
            Promise.all(valuesPromises).then(() => {
                let productFeaturesWithValue = [];
                for (var i = 0; i < productFeatureValues.length; i++) {
                    let pfv = productFeatureValues[i];
                    let pf = this.productFeatures.find(e => e.id == pfv.id_feature);
                    productFeaturesWithValue.push(pf.cloneWithValue());
                }
                resolve(productFeaturesWithValue);
            }).catch(err=>reject(err));
        });
    }
}

export default ProductFeatureRegistry;