import { CacheUtil as $cu } from '@/CacheUtil.js';
// import axios from 'axios';

const axios = {
   create() {}
};

const $am = {
   send: axios.create({}),
   falback: null,
   globalLoader: {
      start() {},
      finish() {},
      flagFallback() {}
   },

   getAccessToken() {},

   /**
    * A way to override authorization type if "Bearer" is not the desired type.
    * The token argument is the value returned via getAccessToken
    */
   renderAuthorizationHeaderValue(token) {
      return `Bearer ${token}`;
   },

   /**
    * cancel(message, options), isCanceled(), getCanceledDetails() should be implemented on the promise.
    * "cancelable" attr should be added to promise
    * cancel should return the promise
    * must return a promise
    * 
    * This cancel flow is setup for axios >= 0.22
    */
   applyCancelCapabilities(fnPromise, reqOptions) {
      if (fnPromise) {
         const controller = new AbortController();
         const cancelDetails = {
            canceled: false,
            message: ''
         };

         reqOptions.signal = controller.signal;

         const promise = fnPromise();

         promise.cancelable = true;

         promise.cancel = (message, data, options) => {
            cancelDetails.canceled = true;
            cancelDetails.message = message;
            cancelDetails.data = data;
            cancelDetails.reqOptions = reqOptions;
            controller.abort();

            return promise;
         };

         promise.isCanceled = () => {
            return cancelDetails.canceled;
         };

         promise.getCanceledDetails = () => {
            if (cancelDetails.canceled) {
               return {
                  ...cancelDetails
               };
            }
         };

         return promise;
      }
   }
};

const applyAuthHeader = (reqOps) => {
   const token = $am.getAccessToken();

   if (token) {
      reqOps.headers = reqOps.headers ?? {};
      reqOps.headers.Authorization = $am.renderAuthorizationHeaderValue(token);

      // test Req Header size limit
      // for (let i = 0; i < 5; i++) {
      //    headers[`MAH${i}`] = token;
      // }
   }

   return reqOps;
};

/**
 * ctx {
 *    send // currently axios or custom method for fixtures
 *    fallback // method to use if ajaxSend request fails.  only if fixtures is off and fallback is true
 *    globalLoader
 *    getAccessToken
 *    renderAuthorizationHeaderValue
 *    applyCancelCapabilities
 * }
 * 
 * axiosConfig -> https://github.com/axios/axios#request-config
 * if axiosConfig is defined, the "send" property will be overwritten
 * with an axios instance
 *
 */
const initAjax = (ctx = {}, axiosConfig) => {
   if (ctx) {
      Object
         .keys(ctx)
         .forEach((k) => {
            $am[k] = ctx[k]
         });
   }

   if (axiosConfig) {
      initAxios(axiosConfig);
   }
};

/**
 * https://github.com/axios/axios#request-config
 *
 */
const initAxios = (config = {}) => {
   if (config) {
      $am.send = axios.create(config);
   }
};

/**
 * see https://github.com/axios/axios#request-config
 *
 * options (not axios) {
 *    isBackgroundRequest {Boolean} - hides global loader/wait indicator
 *    alwaysResolve {Boolean} - will always resolve or reject call bypassing active route check
 *    cache {Boolean} - flag to indicate if the result should be cached.
 *                      paged results should not be cached.
 *                      results for "get" verb can only be cached
 *    cacheKey {String} - the key to store/retrieve the data under. requied if cache is true
 *    cacheTTL {Number} - cache "Time To Live", the amount of time in minutes to allow the cache to live
 *                        default is 5 minutes. see CacheUtil.store
 * }
 *
 */
function send(options) {
   return $am.applyCancelCapabilities(() => sendWrapper($am.send, options), options);
}

function getActiveRouteName() {
   return window?.location?.pathname;
}

function canResolveOrReject(reqOps) {
   return reqOps && (reqOps.alwaysResolve || (reqOps._activeRouteName === getActiveRouteName()));
}

function sendWrapper(fnSend, reqOps, sOps = {}) {
   // capture the current route the request was made on.  if we are
   // no longer on that route, we will not resolve or reject the call.
   reqOps._activeRouteName = getActiveRouteName();

   const promise = new Promise(function (resolve, reject) {
      let cache;
      const fnResolve = (response) => {
         if (canResolveOrReject(reqOps)) {
            resolve(response);
         }
      };
      const fnReject = (err) => {
         if (canResolveOrReject(reqOps)) {
            reject(err);
         }
      };

      if (reqOps.url) {
         if (!reqOps.isBackgroundRequest) {
            $am.globalLoader.start?.();
         }

         cache = reqOps.cache && $cu.getCache(reqOps);

         if (cache) {
            setTimeout(() => {
               // NOTE-SILENT: we don't want to remove the loader if a silent call completes.
               // a non-silent call could have started the loader. also, we must remove before
               // the resolve handler is called as the resolve handler may kick off another request...
               if (!reqOps.isBackgroundRequest) {
                  $am.globalLoader.finish?.();
               }

               fnResolve({
                  data: cache
               });
            });
         }
         else {
            /**
             * Remove any query params ending with '_'
             */
            if (reqOps && reqOps.params) {
               const pkeys = Object.keys(reqOps.params).filter(k => /_$/.test(k));

               if (pkeys && pkeys.length) {
                  pkeys
                     .forEach((key) => {
                        delete reqOps.params[key];
                     });
               }
            }

            const finalReqOps = applyAuthHeader({
               timeout: 2 * 60 * 1000, // 2 min
               crossDomain: true,
               ...reqOps
            });

            fnSend(finalReqOps)
               .then((response) => {
                  let statusCode = response?.data?.statusCode || '';

                  statusCode = statusCode.substr(statusCode.length - 3, 3);

                  // see NOTE-SILENT
                  if (!reqOps.isBackgroundRequest) {
                     $am.globalLoader.finish?.();
                  }

                  if (statusCode && ['000', '200'].indexOf(statusCode) < 0) {
                     fnReject(generateError('service', response.data));
                  }
                  else {
                     if (reqOps.cache) {
                        // we'll only store the data received from the call, not the entire axios response
                        $cu.store(reqOps, response.data);
                     }
                     fnResolve(response);
                  }
               })
               .catch((error) => {
                  let canceled;
                  const status = error && error.response && error.response.status;

                  if (promise.cancelable && promise.isCanceled()) {
                     canceled = true;
                     error.canceled = true;
                     error.cancelDetails = promise.getCanceledDetails();
                     // console.info('<<< REQUEST::Canceled >>>', promise.getCanceledDetails().message);
                  }
                  else {
                     console.warn('<<< SEND::Error >>>', error);
                  }

                  // "fallback" should not be set if fixtures is "on"
                  if (!canceled && !/401|403/.test(status) && $am.fallback && !sOps.fallbackAttempt && (!reqOps.fnPreventFallback || !reqOps.fnPreventFallback(error))) {
                     if (!reqOps.isBackgroundRequest) {
                        $am.globalLoader.flagFallback?.();
                     }

                     // only need to relay the response and error.  the call to the wrapper
                     // would handle the loader and setting the correct data for the response and error
                     sendWrapper($am.fallback, reqOps, { fallbackAttempt: true })
                        .then(resp => fnResolve(resp))
                        .catch(err => fnReject(err));
                  }
                  else {
                     // see NOTE-SILENT
                     if (!reqOps.isBackgroundRequest) {
                        $am.globalLoader.finish?.();
                     }

                     fnReject(generateError('request', error));
                  }
               });
         }
      }
      else {
         fnReject(new Error('no-url'));
      }
   });

   return promise;
}

function isTimeoutError(error) {
   if (error) {
      const resp = error.response || {};
      const msg = error.message;

      return resp.status === 504 /* Gateway Timeout */ ||
         /timeout/i.test(msg); /* axios sets code to ECONNABORTED for timeouts instead of ETIMEDOUT, so we'll look at the message */
   }

   return false;
}

function generateError(type, error) {
   const resp = error.response || {};

   return {
      timedout: isTimeoutError(error),
      type: type,
      status: resp.status,
      error: error
   };
}

const ajax = {

   /**
    * options {
    * }
    *
    */
   get(url, options = {}) {
      return send({
                  url: url,
                  method: 'get',
                  ...options
               });
   },

   /**
    * options {
    * }
    *
    */
   post(url, data, options = {}) {
      return send({
                  url: url,
                  method: 'post',
                  data: data,
                  ...options
               });
   },

   /**
    * options {
    * }
    *
    */
   put(url, data, options = {}) {
      return send({
                  url: url,
                  method: 'put',
                  data: data,
                  ...options
               });
   },

   /**
    * options {
    * }
    *
    */
   patch(url, data, options = {}) {
      return send({
                  url: url,
                  method: 'patch',
                  data: data,
                  ...options
               });
   },

   /**
    * options {
    * }
    *
    */
   delete(url, options = {}) {
      return send({
                  url: url,
                  method: 'delete',
                  ...options
               });
   }
};

export {
   ajax,
   initAjax,
   initAxios
}
