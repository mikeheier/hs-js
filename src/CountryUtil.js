import Countries from '@/data/countries.min.json';

function padId(id) {
   id = (id ?? '').toString();

   while(id.length < 3) {
      id = `0${id}`;
   }

   return id;
}

export const countries = Countries?.sort((a, b) => {
   if (a.id === '840') {
      return -1;
   }
   else if (b.id === '840') {
      return 1;
   }

   return a.name.localeCompare(b.name);
});

export function getCountryById(id) {
   id = padId(id).toLowerCase();

   return Countries.find(c => `${c.id}`.toLowerCase() === id);
}

export function getCountryBy2Char(abbr2Char) {
   abbr2Char = `${abbr2Char}`.toLowerCase();
   return Countries.find(c => `${c.abbr2Char}`.toLowerCase() === abbr2Char);
}

export function getCountryBy3Char(abbr3Char) {
   abbr3Char = `${abbr3Char}`.toLowerCase();
   return Countries.find(c => `${c.abbr3Char}`.toLowerCase() === abbr3Char);
}

export function getCountry(code) {
   if (!isNaN(code)) {
      return getCountryById(code);
   }
   else {
      const trimmed = (code || '').trim();

      if (trimmed.length < 3) {
         return getCountryBy2Char(trimmed);
      }

      return getCountryBy3Char(trimmed);
   }
}

export const CountryUtil = {
   countries,
   getCountry
};
