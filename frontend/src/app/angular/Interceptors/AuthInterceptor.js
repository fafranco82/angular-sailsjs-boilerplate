/**
 * Auth interceptor for HTTP and Socket request. This interceptor will add required
 * JWT (Json Web Token) token to each requests. That token is validated in server side
 * application.
 *
 * @see http://angular-tips.com/blog/2014/05/json-web-tokens-introduction/
 * @see http://angular-tips.com/blog/2014/05/json-web-tokens-examples/
 */
(function() {
    'use strict';

    angular.module('frontend.interceptors')
        .factory('AuthInterceptor',
            [
                '$q', '$injector', 'Storage',
                function($q, $injector, Storage) {
                    return {
                        /**
                         * Interceptor method for $http requests. Main purpose of this method is to add JWT token
                         * to every request that application does.
                         *
                         * @param   {*} config
                         *
                         * @returns {*}
                         */
                        request: function(config) {
                            var token;

                            if (Storage.get('auth_token')) {
                                token = angular.fromJson(Storage.get('auth_token')).token;
                            }

                            // Yeah we have a token
                            if (token) {
                                if (!config.data) {
                                    config.data = {};
                                }

                                /**
                                 * Set token to actual data and headers. Note that we need bot ways because of
                                 * socket cannot modify headers anyway. These values are cleaned up in backend
                                 * side policy (middleware).
                                 */
                                config.data.token = token;
                                config.headers.Authorization = 'Bearer ' + token;
                            }

                            return config;
                        },

                        /**
                         * Interceptor method that is triggered whenever response error occurs on $http requests.
                         *
                         * @param   {*} response
                         *
                         * @returns {Promise}
                         */
                        responseError: function(response) {
                            if (response.status === 401) {
                                Storage.unset('auth_token');

                                $injector.get('$state').go('anon.login');
                            }

                            return $q.reject(response);
                        }
                    };
                }
            ]
        );
}());
