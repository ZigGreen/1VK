var when = require('when')
    , _ = require('underscore')
    ;

/**
 * contains info for api call, performs api request
 * and provide promise for requested data
 * @param {string} type method name
 * @param {object} param parameters for api call
 * @constructor
 */
function Request(type, param) {

    this._type = type;
    this._param = param;
    this.dfd = when.defer();

}

/**
 * perform api call
 * @param {function} api api call method
 * @returns {Request} this
 */
Request.prototype.start = function (api) {


    api(
        this._type
        , this._param
        , _.compose(this.dfd.resolve, _.property('response'))
    );
    return this;

};

/**
 * gets VKScript representation of request
 * @returns {string}
 */
Request.prototype.toApiString = function () {
    return ['API.', this._type, '(', JSON.stringify(this._param), ')'].join('');
};


module.exports = Request;