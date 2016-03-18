/**
 * Created by kozervar on 2016-03-16.
 */

'use strict';
import Generator from './generator';
import consolidate from 'consolidate';
import Promise from 'bluebird';
import moment from 'moment';
import fs from 'fs';

let generator = new Generator({
    timeout: 10000,
    filename: 'tmp/test.pdf',
    margin: "0",
    "footer": {
        "height": "28mm",
        "contents": '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>'
    }
});

class PDFGenerator {
    constructor() {
    }

    generate(template, product) {
        return new Promise((resolve, reject)=> {
            consolidate.ejs(template, product)
                .then(html => {
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
                .catch(err=>reject(err));
        });
    }
}

export default PDFGenerator;