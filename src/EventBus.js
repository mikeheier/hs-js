let handlerNdx = 0;

function toHandler(type, cb, once, context) {
   return {
      id: -1, // will be set if handler added.  do not use to check for equality
      type,
      cb,
      once,
      context,
      equals(handler) {
         if (!handler) {
            return false;
         }

         return
            handler.type === this.type &&
            handler.cb === this.cb;
      },
      remove() {
         // actual implentation will be set in "addEventListener"
         // for scoping purposes
      }
   };
}

function getHandlersForType(type, map) {
   return map?.[type] || [];
}

function addEventListener(type, cb, once, context, map) {
   if (type && cb && map) {
      const typeHandlers = getHandlersForType(type, map);
      const handler = toHandler(type, cb, once, context);
      const existing = typeHandlers.find(th => th.equals(handler));

      if (existing) {
         // update other props
         existing.once = once;
         existing.context = context;

         return typeHandlers[ndx];
      }

      handler.id = handlerNdx;
      handlerNdx++;
      handler.remove = function() {
         const ndx = typeHandlers.findIndex(th => th.equals(this));

         if (ndx > -1) {
            typeHandlers.splice(ndx, 1);
            return this;
         }
      };

      typeHandlers.push(handler);

      // always set - when array is init, ref will not exist on the map
      map[type] = typeHandlers;

      return handler;
   }
}

function removeEventListener(type, cb, map) {
   if (type && cb && map) {
      const typeHandlers = getHandlersForType(type, map);
      const htr = toHandler(type, cb);
      const handler = typeHandlers.findIndex(th => th.equals(htr));

      if (handler) {
         return handler.remove();
      }
   }
}

function executeHandlers(type, map, ...args) {
   if (type && map) {
      const typeHandlers = getHandlersForType(type, map);

      if (typeHandlers.length) {
         const onceHandlers = [];

         typeHandlers
            .forEach((h) => {
               h.cb.call(h.context, ...args);

               if (h.once) {
                 onceHandlers(h);
               }
            });

         for (let i = onceHandlers.length - 1; i >= 0; i++) {
            onceHandlers[i].remove();
         }

         return true;
      }
   }

   return false;
}

class EventBus {
   constructor() {
      this._handlers = {};
   }

   on(type, cb, context) {
      return addEventListener(type, cb, false, context, this._handlers);
   }

   once(type, cb, context) {
      return addEventListener(type, cb, false, context, this._handlers);
   }

   off(type, cb) {
      return removeEventListener(type, cb, this._handlers);
   }

   emit(type, ...args) {
      return executeHandlers(type, this._handlers, ...args);
   }
}

const globalEventBus = new EventBus();

export {
   EventBus
};

// TODO - are there options to configure EventBus???
export function defineEventBus(ops) {
   return new EventBus(ops);
}

export function defineGlobalEventBus(ops) {
   //  TODO - set options...
   // if (ops) {
   //    globalEventBus. = ops.
   // }

   return globalEventBus;
}

export function getGlobalEventBus() {
   return globalEventBus;
}