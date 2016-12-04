var _ = require('underscore');

/**
 * takes care of requests perform
 * encapsulating logic for execution limited amount requests per time interval
 * @param {number} limit how much requests can perform for coldTime
 * @param {number} coldTime time interval (ms) after what, we can perform next request if we were over the limit
 * @param {function} api api call method
 * @constructor
 */
function LimitingQueue(limit, coldTime, api) {


    this._limit = limit;
    this._coldTime = coldTime;
    this._api = api;

    /**
     * how much requests can perform before out of requests limit
     * @private
     */
    this._requestToLimit = limit;

    /**
     * line of pending requests
     * @private
     */
    this._line = [];

    /**
     * @type {null|number}
     * @private
     */
    this._timeout = null;
    this._processRejection = this._processRejection.bind(this);
}

/**
 * add request to the queue and perform it as soon as possible
 * corresponding to its position on the queue
 * @param request
 * @param {boolean} [toTop] adds the request to head of the queue
 * @returns {Promise}
 */
LimitingQueue.prototype.add = function (request, toTop) {

    var promise = request.dfd.promise.catch(this._processRejection.bind(this, request));

    if (!this.startRequest(request))
        if (toTop)
            this._line.unshift(request);
        else
            this._line.push(request);

    return promise;

};


LimitingQueue.prototype._processRejection = function (request, err) {

    if (err.error_code == 6) {
        // rerequest
        return this.add(request.restorePromise(), true);
    }
    else
        throw err;

};

/**
 * perform request
 * @param request
 * @returns {boolean} true if request have been performed; false if we out of the requests limit
 */
LimitingQueue.prototype.startRequest = function (request) {
    if (this._timeout === null)
        this._timeout = setTimeout(this.resetLimit.bind(this), this._coldTime);

    if (this._requestToLimit) {

        request.start(this._api);
        this._requestToLimit--;
        return true;

    } else {
        return false;
    }

};


LimitingQueue.prototype.resetLimit = function () {

    this._timeout = null;
    this._requestToLimit = this._limit;
    var pendingRequests = this._line.splice(0, this._limit);
    _.each(pendingRequests, this.startRequest, this);

};

module.exports = LimitingQueue;