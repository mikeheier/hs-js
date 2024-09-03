import { yankArgs } from '../dist/node-util.min.mjs';
import GeneralTest from './general.test.js';
import UtilsTest from './utils.test.js';
import ModelTest from './model.test.js';
import StorageTest from './storage.test.js';
import UuidTest from './uuid.test.js';
import DateUtilTest from './dateutil.test.js';

// eg  npm run test -- ---test:UtilsTest
const testArgs = yankArgs().test ?? null;
const tests = [
   { runner: GeneralTest, name: 'GeneralTest' },
   { runner: UtilsTest, name: 'UtilsTest' },
   { runner: ModelTest, name: 'ModelTest' },
   { runner: StorageTest, name: 'StorageTest' },
   { runner: UuidTest, name: 'UuidTest' },
   { runner: DateUtilTest, name: 'DateUtilTest' }
];



tests
   .forEach((test) => {
      if (typeof test?.runner === 'function' && (!testArgs || test.name.toLowerCase().trim() === testArgs.toLowerCase().trim())) {
         console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
         console.log(`<<< ${test.name ?? 'Test'} >>>`)
         test.runner();
         console.log('----------------------------------------------------------------------------------------------------------\n');
      }
   });
