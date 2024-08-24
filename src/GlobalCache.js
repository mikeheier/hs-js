/**
 * When creating multiple exports with modules that may rely on local caching, the "local" cache
 * may actually need to be "global" or at least local to all exported versions of a module.
 *
 * eg.  routeUtil... the routeUtil requires the "router" to be injected.  The RouterUtilPlugin will try to add the
 *      the router instance automaticlly, but that is dependent on order (the router needs to be initialized and added to the app instance first).
 *      the routeUtil also exports an init method, wich can be used to set the router instance.  the init method is only available via direct import
 *      and not from installing the entire plugin.
 */

const _cache = {};

function get(key) {
   return _cache[key];
}

function set(key, value) {
   return _cache[key] = value;
}

const gc = {
   get,
   set
};

export {
   gc
}