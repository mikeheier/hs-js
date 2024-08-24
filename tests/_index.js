import GeneralTest from './general.test.js';
import ModelTest from './model.test.js';
import StorageTest from './storage.test.js';
import UuidTest from './uuid.test.js';
import DateUtilTest from './dateutil.test.js';

const tests = [
   { runner: GeneralTest, name: 'GeneralTest' },
   { runner: ModelTest, name: 'ModelTest' },
   { runner: StorageTest, name: 'StorageTest' },
   { runner: UuidTest, name: 'UuidTest' },
   { runner: DateUtilTest, name: 'DateUtilTest' }
];

tests
   .forEach((test) => {
      if (typeof test?.runner === 'function') {
         console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
         console.log(`<<< ${test.name ?? 'Test'} >>>`)
         test.runner();
         console.log('----------------------------------------------------------------------------------------------------------\n');
      }
   });
