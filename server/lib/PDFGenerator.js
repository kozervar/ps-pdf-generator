/**
 * Created by kozervar on 2016-03-16.
 */

'use strict';
import Generator from './generator';
import consolidate from 'consolidate';
import Promise from 'bluebird';
import moment from 'moment';
import fs from 'fs';
import beautify from 'js-beautify';

let generator = new Generator({
    width: '210mm',
    height: '297mm',
    timeout: 600000,
    filename: 'tmp/test.pdf',
    margin: {
        top:    '0',
        bottom: '6mm',
        left:   '11mm',
        right:  '7mm'
    },
    header: {
        height: "19mm",
        contents: '<div style="font-family: \'Source Sans Pro\', sans-serif;">{{page}} / {{pages}}</div>'
    }
});

class PDFGenerator {
    constructor() {
    }

    generate(template, product) {
        return new Promise((resolve, reject)=> {
            //fs.writeFile('tmp/products.json', JSON.stringify(product.products), function(err) {
            //    if(err) {
            //        return console.log(err);
            //    }
            //    console.log("JSON file was saved!");
            //});
            consolidate.ejs(template, product)
                .then(html => {
                    //html = html.replace( new RegExp( "\>[\s]+\<" , "g" ) , "><" );
                    html = beautify.html(html, {"preserve_newlines" : false});
                    generator.options.filename = 'tmp/' + moment().format('YYYYMMDD_HHmmss') + '.pdf';
                    fs.writeFile('tmp/tmp.html', html, function(err) {
                        if(err) {
                            return console.log(err);
                        }
                        console.log("HTML file was saved!");
                    });
                    console.log('Generating PDF ... ', generator.options.filename);
                    return generator.generate(html);
                })
                .then(data => {
                    console.info('PDF generated. File: ', data.filename);
                    resolve(product);
                })
                .catch(err=>{
                    console.log(err);
                    reject(err);
                });
        });
    }
}

export default PDFGenerator;