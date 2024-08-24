import colors from 'colors/safe';

// to pass args from cmd line (not via script directly)
// use "-- --" followed by "---<key>:<value>"
// eg ->  npm run build -- -- ---empName:"mike heier" ---eid:763341 ---email:miike.heier.osv@fedex.com
export function yankArgs() {
   const cmdLineArgs = {};

   // first 2 arg are node.exe & nuxt.js
   const args = process.argv.slice(2, process.argv.length);
   logger.error(process.argv);

   if (args && args.length) {
      args
         .forEach((arg, ndx, ary) => {
            // we'll use '---' as nuxt uses '--' && '-'.  this is to prevent
            // confusing nuxt with our custom arguments
            const regX = /---(\w+):/;
            const result = regX.exec(arg);
            // console.log('>>>>', arg, result?.[1]);

            if (result && result[1]) {
               let repVal = arg.replace(regX, "");

               // convert bools
               if (/^true$|^false$/.test(repVal)) {
                  repVal = repVal === 'true';
               }
               // convert numbers - empty string will convert to 0
               else if (repVal && !isNaN(repVal)) {
                  repVal = Number(repVal);
               }

               cmdLineArgs[result[1]] = repVal;
            }
         });
   }

   if (Object.keys(cmdLineArgs).length) {
      logger.info('cmd args\n', JSON.stringify(cmdLineArgs, null, 3));

      const custEnvVars = Object.keys(cmdLineArgs).filter(k => /^env/i.test(k));

      (custEnvVars || [])
         .forEach((ek) => {
            addEnvVar(ek, cmdLineArgs[ek]);
         });
   }

   return cmdLineArgs;
}

export function dumpEnvVars(regex) {
   const env = process.env ?? {};

   Object
      .keys(env)
      .forEach((key) => {
         if (!regex || regex?.test(key)) {
            console.log(`${colors.blue(key)}:`, colors.green(env[key]));
         }
      });
}

export const logger = {
   debug(...args) {
      console.log(colors.green('<<< DEBUG >>>'), ...args);
   },
   info(...args) {
      console.log(colors.blue('<<< INFO >>>'), ...args);
   },
   warn(...args) {
      console.log(colors.yellow('<<< WARN >>>'), ...args);
   },
   error(...args) {
      console.log(colors.red('<<< ERROR >>>'), ...args);
   }
};

export default {
   yankArgs,
   dumpEnvVars,
   logger
}
