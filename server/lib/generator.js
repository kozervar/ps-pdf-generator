/**
 * Created by kozervar on 2016-03-15.
 */

'use strict';
import childProcess from 'child_process';
import phantomJS from 'phantomJS-prebuilt';
import path from 'path';

class Generator {

    constructor(options){
        this.phantomPath = phantomJS && phantomJS.path;

        this.phantomArgs = [];

        this.script = path.join(__dirname, 'scripts', 'phantom-generator.js');

        if(options)
            this.options = options;
        else
            this.options = {
                timeout : 30000
            };
    }

    generate(html, callback){

        console.log('Generating PDF ...');

        var child = childProcess.spawn(this.phantomPath, [].concat(this.phantomArgs, [this.script]));
        var stdout = [];
        var stderr = [];

        var timeout = setTimeout(()=>{
            child.stdin.end();
            child.kill();
            if (!stderr.length) {
                stderr = [new Buffer('PDF generation timeout. Phantom.js script did not exit.')];
            }
        }, this.options.timeout);

        child.stdout.on('data', (buffer) => {
            return stdout.push(buffer);
        });
        child.stderr.on('data', (buffer) => {
            stderr.push(buffer);
            child.stdin.end();
            return child.kill();
        });

        child.on('exit', (code) => {
            clearTimeout(timeout);
            if (code || stderr.length) {
                var err = new Error(Buffer.concat(stderr).toString() || 'Generator: Unknown Error');
                return callback(err);
            } else {
                try {
                    var buff = Buffer.concat(stdout).toString();
                    var data = (buff) != null ? buff.trim() : undefined;
                    data = JSON.parse(data)
                } catch (err) {
                    return callback(err)
                }
                return callback(null, data)
            }
        });

        var res = JSON.stringify({html: html, options: this.options});
        return child.stdin.write(res + '\n', 'utf8')
    }
}

export default Generator;