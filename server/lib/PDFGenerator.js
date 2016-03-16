/**
 * Created by kozervar on 2016-03-16.
 */

'use strict';
import Generator from './generator';
import consolidate from 'consolidate';
import Promise from 'bluebird';

let generator = new Generator({
    timeout: 10000,
    filename: 'tmp/test.pdf'
});

class PDFGenerator {
    constructor() {
    }

    generate(template, product) {
        return new Promise((resolve, reject)=> {
            consolidate.ejs(template, product)
                .then(html => {
                    console.log('Generating PDF ...');
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