export class Ajax {
    public get(url): Promise<any> {
        return this.request({method: 'GET', url: url});
    };

    // {
    //     method: String,
    //         url: String,
    //     params: String | Object,
    //     headers: Object
    // }
    public request(opts): Promise<any> {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (opts.params && typeof opts.params === 'object' && opts.method === 'GET') {
                opts.url += '?' + _this.buildUrlParams(opts.params);
                opts.params = '';
            }
            var xhr = new XMLHttpRequest();
            xhr.open(opts.method, opts.url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText,
                        response: xhr.response
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText,
                    response: xhr.response
                });
            };
            if (opts.headers) {
                Object.keys(opts.headers).forEach(function (key) {
                    xhr.setRequestHeader(key, opts.headers[key]);
                });
            }
            let data = opts.data;
            if (!data) {
                data = opts.param;
                if (data && typeof data === 'object') {
                    data = _this.buildUrlParams(data);
                }
            }
            xhr.send(data);
        });
    };

    private buildUrlParams(params): string {
        return Object.keys(params).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');
    }
}
