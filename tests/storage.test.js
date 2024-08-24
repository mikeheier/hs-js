import { GlobalStorageManager } from '../dist/hs-core.min.mjs';

export default () => {
   GlobalStorageManager.session.set('name', 'Mike');
   GlobalStorageManager.session.set('setItem', () => 'Mike');

   console.log(GlobalStorageManager);
   console.log(GlobalStorageManager.getContext());

   GlobalStorageManager.session.clear((key, base) => {
      console.log('>>>', key, base);

      return true;
   });
   console.log(GlobalStorageManager.session.get('name'));
   // console.log(GlobalStorageManager.session.remove('name'));
   console.log(GlobalStorageManager);
}
