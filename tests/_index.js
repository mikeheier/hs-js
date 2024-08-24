import GeneralTest from './general.test.js';
import ModelTest from './model.test.js';
import StorageTest from './storage.test.js';
import UuidTest from './uuid.test.js';
import DateUtilTest from './dateutil.test.js';

const tests = [
   GeneralTest,
   ModelTest,
   StorageTest,
   UuidTest,
   DateUtilTest
];

tests
   .forEach((test) => {
      if (typeof test === 'function') {
         console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
         test();
         console.log('----------------------------------------------------------------------------------------------------------\n');
      }
   });
