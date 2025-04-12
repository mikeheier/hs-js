export function loadImage(path) {
   return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = (ev) => {
         // console.log('>>>', path, image.naturalWidth, image.naturalHeight);
         resolve(image);
      };

      image.onerror = (err) => {
         console.log('%c<<< ERROR >>>', 'color:#ff0000;', err);
         // always resolve
         resolve();
      };

      image.src = path;
   });
}

export const ImageUtil = {
   loadImage
};
