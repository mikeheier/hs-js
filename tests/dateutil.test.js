import { DateUtil } from '../dist/date-util.min.mjs';

export default () => {
   console.log(DateUtil);
   console.log(DateUtil.format(new Date(), { format: 'MM-DD-YYYYThh:mm:ss.SSS z' }));
   console.log(DateUtil.guessTz());
}
