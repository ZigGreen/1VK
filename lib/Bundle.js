var when = require('when')
    , _ = require('underscore')
    ;

/**
 * Bundles several requests and perform
 * request with the execute api method
 * @param {number} size bundle size
 * @constructor
 */
function Bundle(size) {

    this.size = size || 25;
    this.requests = [];
    this.dfd = when.defer();

}


Bundle.prototype.restorePromise = function () {
    this.dfd = when.defer();
    return this;
};

/**
 * @returns {boolean} false if requests can't be added without crossing predefined bundle size
 */
Bundle.prototype.isFull = function () {
    return (this.requests.length === this.size)
};

/**
 * adds request to the bundle
 * @param {Request} req
 * @returns {Bundle} this
 */
Bundle.prototype.add = function (req) {
    this.requests.push(req);
    return this;
};


Bundle.prototype.toApiString = function () {

    var code = 'var results = []; \n';

    _.each(this.requests, function (req) {
        code += 'results.push(' + req.toApiString() + '); \n'
    }, this);

    code += 'return results;';

    return code;

};

/**
 * perform api call
 * @param {function} api api call method
 * @returns {Request} this
 */
Bundle.prototype.start = function (api) {

    if (this.requests.length == 1) {
        this.requests[0].start();
    }

    api('execute', {
            code: this.toApiString()
        }
        , this._handleResponse.bind(this)
    );

};


Bundle.prototype._handleResponse = function (r) {

    if (r.error)
        this.dfd.reject(r.error);
    else
        this._resolveResults(r.response);

};


Bundle.prototype._resolveResults = function (results) {


    _.each(results, function (result, index) {
        this.requests[index].dfd.resolve(result);
    }, this)

};


module.exports = Bundle;