class ResizeManager_ {
   constructor() {
      this._inited = false;
      this.handlers = [];
   }

   initWindowResizeHandler() {
      if (!this._inited && window) {
         this._inited = true;

         window.addEventListener('resize', this.windowResizeHandler.bind(this));
      }
   }

   windowResizeHandler(ev) {
      for (let i = 0; i < this.handlers.length; i++) {
         const hobj = this.handlers[i];

         hobj.handler.call(hobj.thisArg, ev);
      }
   }

   registerHandler(scope, handler, thisArg) {
      if (scope && typeof handler === 'function') {
         this.initWindowResizeHandler();

         const hobj = this.handlers.find(o => o.scope === scope);

         if (hobj) {
            hobj.handler = handler;
            hobj.thisArg = thisArg;
         }
         else {
            this.handlers.push({
               scope,
               handler,
               thisArg
            });
         }
      }
   }

   unregisterHandler(scope) {
      if (scope) {
         const ndx = this.handlers.findIndex(o => o.scope === scope);

         if (ndx > -1) {
            this.handlers.splice(ndx, 1);
         }
      }
   }
}

const _resizeManager = new ResizeManager_();

export const ResizeManager = {
   registerHandler: (scope, handler, thisArg) => _resizeManager.registerHandler(scope, handler, thisArg),
   unregisterHandler: (scope) => _resizeManager.unregisterHandler(scope)
};