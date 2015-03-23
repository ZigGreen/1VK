var LimitingQueue = require('./LimitingQueue')
    , Bundle = require('./Bundle')
    , Request = require('./Request')
    , _ = require('underscore')
    ;

/**
 * Packs requests into bundle
 * @param {number} limit how much requests can perform for coldTime
 * @param {number} coldTime time interval (ms) after what, we can perform next request if we were over the limit
 * @param {function} api api call method
 * @constructor
 */
function ApiQueue(limit, coldTime, api) {

    this.queue = new LimitingQueue(limit, coldTime, api);
    this.currentBundle = new Bundle();

}


ApiQueue.prototype.request = function (type, param) {

    var request = new Request(type, param);

    if (this.currentBundle.add(request).isFull())
        this.sendCurrentBundleImmediate();
    else
        this.sendCurrentBundle();

    return request.dfd.promise;

};


ApiQueue.prototype.sendCurrentBundleImmediate = function () {

    this.queue.add(this.currentBundle).catch(function (error) {
        console.error(error);
    });
    this.currentBundle = new Bundle();

};


ApiQueue.prototype.sendCurrentBundle = _.debounce(ApiQueue.prototype.sendCurrentBundleImmediate, 50);


module.exports = ApiQueue;