import { generateUUID } from '../dist/utils.min.mjs';

export default () => {
   for (let i = 0; i < 9; i++) {
      console.log(generateUUID());
   }

   for (let i = 0; i < 9; i++) {
      console.log(generateUUID(true));
   }
}
