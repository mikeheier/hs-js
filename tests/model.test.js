import { BaseModel } from '../dist/hs-core.min.mjs';

export default () => {
   const model = new BaseModel({
      id: '14',
      name: 'Mike Heier',
      sports: [
            'Soccer',
            'Basketball',
            'Baseball',
            'Volleyball',
            'Tennis',
            'Hockey'
         ]
   });

   console.log(model);
   console.log(model.serialize());
   console.log(model.toPlainObject({ excludePrivate: false }));
   console.log(model.toPlainObject({ excludePrivate: true }));

   model.backup();
   console.log(model.hasChanges());
   model.sports.push('Ping Pong');
   console.log(model.hasChanges());
}
