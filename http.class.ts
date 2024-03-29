const fs = require('fs');
const net = require('net');
const URL = require('url').URL;

export class HttpLibrary {

    public get(verbose: boolean, redirect: boolean, headers: string[], hostStr: string, output?: string): void {

        // Create connection
        let urlObj = new URL(hostStr);
        let socket = net.createConnection(urlObj.port ? urlObj.port : 80, urlObj.hostname);

        // Parse headers into a string
        let headerObj = '';
        for (let i = 0; i < headers.length; ++i) {
            headerObj = headerObj + headers[i];
            if (i + 1 < headers.length) {
                headerObj = headerObj + '\r\n';
            }
        }

        // Overwrite host/connection headers
        let requestLine = 'GET ' + hostStr + ' HTTP/1.1\r\n' +
            'Host: ' + urlObj.hostname + '\r\n' +
            'Connection: close\r\n' +
            headerObj + '\r\n\r\n';

        // Socket listeners
        socket.on('data', (data) => {

            // Extract status code
            const statusCode = parseInt(data.toString().split('\r\n')[0].split(' ')[1]);

            // Check for redirect
            if (redirect && statusCode < 303 && statusCode > 299) {
                for (const line of data.toString().split('\r\n').slice(1)) {
                    const i = line.indexOf(': ');
                    const k = line.substr(0, i).toLowerCase();
                    const v = line.substr(i + 2);
                    if (k.toLocaleLowerCase() === 'location') {
                        this.get(verbose, redirect, headers, v, output);
                        return;
                    }
                }
            }

            // Standard output operations
            if (output) {
                fs.writeFileSync(output, verbose ? data.toString() : data.toString().split('\r\n\r\n')[1]);
                console.log('');
                console.log('Output sent to file: ' + output + '.');
            } else {
                console.log('');
                console.log(verbose ? data.toString() : data.toString().split('\r\n\r\n')[1]);
            }
        }).on('connect', function() {
            socket.write(requestLine);
        }).on('end', function() {
            socket.destroy();
        }).on('error',function(error){
            console.log('Error : ' + error);
        });
    }

    public post(verbose: boolean, redirect: boolean, headers: string[], hostStr: string, file?: string, data: string = '', output?: string): void {
        // Create connection
        let urlObj = new URL(hostStr);
        let socket = net.createConnection(urlObj.port ? urlObj.port : 80, urlObj.hostname);

        // Parse headers into a string
        let headerObj = '';
        for (let i = 0; i < headers.length; ++i) {
            headerObj = headerObj + headers[i];
            if (i + 1 < headers.length) {
                headerObj = headerObj + '\r\n';
            }
        }

        // Parse file if exists
        if (file) {
            data = fs.readFileSync(file, "utf8");
        }

        // Overwrite host/connection headers
        let requestLine = 'POST ' + hostStr + ' HTTP/1.1\r\n' +
            'Host: ' + urlObj.hostname + '\r\n' +
            'Connection: close\r\n' +
            'Content-Length: ' + data.length + '\r\n' +
            headerObj + '\r\n\r\n' + data;

        // Socket listeners
        socket.on('data', (data) => {

            // Extract status code
            const statusCode = parseInt(data.toString().split('\r\n')[0].split(' ')[1]);

            // Check for redirect
            if (redirect && statusCode < 303 && statusCode > 299) {
                for (const line of data.toString().split('\r\n').slice(1)) {
                    const i = line.indexOf(': ');
                    const k = line.substr(0, i).toLowerCase();
                    const v = line.substr(i + 2);
                    if (k.toLocaleLowerCase() === 'location') {
                        this.post(verbose, redirect, headers, v, file, data, output);
                        return;
                    }
                }
            }

            // Standard output operations
            if (output) {
                fs.writeFileSync(output, verbose ? data.toString() : data.toString().split('\r\n\r\n')[1]);
                console.log('');
                console.log('Output sent to file: ' + output + '.');
            } else {
                console.log('');
                console.log(verbose ? data.toString() : data.toString().split('\r\n\r\n')[1]);
            }
        }).on('connect', function() {
            socket.write(requestLine);
        }).on('end', function() {
            socket.destroy();
        }).on('error',function(error){
            console.log('Error : ' + error);
        });
    }
}
