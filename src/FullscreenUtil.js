import { isNil } from 'lodash';

const FullscreenUtil = {
   isFullscreen() {
      return !isNil(this.getFullscreenElement());
   },

   getFullscreenElement() {
      return document.fullscreenElement ||
         document.webkitFullscreenElement ||
         document.mozFullScreenElement ||
         document.msFullscreenElement;
   },

   requestFullscreen(element, fullscreenChange) {
      if (document && element) {
         if (element.requestFullscreen) {
            element.requestFullscreen();
         }
         else if (element.webkitRequestFullScreen) {
            element.webkitRequestFullScreen();
         }
         else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
         }
         else if (element.msRequestFullScreen) {
            element.msRequestFullScreen();
         }

         // we can only have one element at a time in fullscreen,
         // so we'll reinit the onfullscreenchange method each request
         document.onwebkitfullscreenchange =
         document.onmsfullscreenchange =
         document.onmozfullscreenchange =
         document.onfullscreenchange = () => {
            if (fullscreenChange) {
               fullscreenChange(this.getFullscreenElement());
            }
         };
      }
   },

   exitFullscreen() {
      if (document.exitFullscreen) {
         document.exitFullscreen();
      }
      else if (document.webkitExitFullscreen) {
         document.webkitExitFullscreen();
      }
      else if (document.mozCancelFullScreen) {
         document.mozCancelFullScreen();
      }
      else if (document.msCancelFullScreen) {
         document.msCancelFullScreen();
      }
   }
};

export {
   FullscreenUtil
};
