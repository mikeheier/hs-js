import { DateUtil } from '../dist/date-util.min.mjs';

export default () => {
   console.log(DateUtil);
   console.log(DateUtil.format(new Date(), { format: 'MM-dd-yyyy\'T\'HH:mm:ss.SSS ZZZZ' }));
   console.log(DateUtil.guessTz());
}
