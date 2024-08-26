class HsCustomEvent extends CustomEvent {
   constructor(type, originalEvent, data) {
      super(type || originalEvent?.type || 'hsevent', {
         detail: data,
         cancelable: true
      });

      this.originalEvent = originalEvent;

      Object
         .keys(data ?? {})
         .forEach((key) => {
            this[key] = data[key];
         });
   }

   preventDefault() {
      super.preventDefault();

      if (this.originalEvent?.preventDefault) {
         this.originalEvent.preventDefault();
      }
   }

   stopImmediatePropagation() {
      super.stopImmediatePropagation();

      if (this.originalEvent?.stopImmediatePropagation) {
         this.originalEvent.stopImmediatePropagation();
      }
   }

   stopPropagation() {
      super.stopPropagation();

      if (this.originalEvent?.stopPropagation) {
         this.originalEvent.stopPropagation();
      }
   }
}

export {
   HsCustomEvent
};
