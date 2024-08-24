import GeneralTests from './general.test.js';
import ModelTests from './model.test.js';
import StorageTests from './storage.test.js';
import UuidTests from './uuid.test.js';

const tests = [
   GeneralTests,
   ModelTests,
   StorageTests,
   UuidTests
];

tests
   .forEach((test) => {
      if (typeof test === 'function') {
         test();
      }
   });
