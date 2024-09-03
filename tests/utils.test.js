import { Utils } from '../dist/utils.min.mjs';

const colors = [
   // colors
  { name: '--hs-blue', hex: '#0261b5' },
  { name: '--hs-blue-light', hex: '#78b7f0' },
  { name: '--hs-blue-dark', hex: '#013d73' },
  { name: '--hs-navy-blue', hex: '#012240' },
  { name: '--hs-indigo', hex: '#6610f2' },
  { name: '--hs-purple', hex: '#6f42c1' },
  { name: '--hs-pink', hex: '#d63384' },
  { name: '--hs-red', hex: '#dc3545' },
  { name: '--hs-orange', hex: '#fd7e14' },
  { name: '--hs-yellow', hex: '#ffc107' },
  { name: '--hs-gold', hex: '#D4AF37' },
  { name: '--hs-green', hex: '#198754' },
  { name: '--hs-teal', hex: '#20c997' },
  { name: '--hs-cyan', hex: '#0dcaf0' },
  { name: '--hs-black', hex: '#000000' },
  { name: '--hs-white', hex: '#ffffff' },

  // greys
  { name: '--hs-grey', hex: '#808080' },
  { name: '--hs-grey-dark', hex: '#555555' },
  { name: '--hs-grey-100', hex: '#eeeeee' },
  { name: '--hs-grey-200', hex: '#dddddd' },
  { name: '--hs-grey-300', hex: '#cccccc' },
  { name: '--hs-grey-400', hex: '#bbbbbb' },
  { name: '--hs-grey-500', hex: '#aaaaaa' },
  { name: '--hs-grey-600', hex: '#999999' },
  { name: '--hs-grey-700', hex: '#888888' },
  { name: '--hs-grey-800', hex: '#777777' },
  { name: '--hs-grey-900', hex: '#666666' },

  // variants
  { name: '--hs-primary', hex: '#0261b5' },
  { name: '--hs-secondary', hex: '#808080' },
  { name: '--hs-success', hex: '#198754' },
  { name: '--hs-info', hex: '#0dcaf0' },
  { name: '--hs-warning', hex: '#ffc107' },
  { name: '--hs-danger', hex: '#dc3545' },
  { name: '--hs-light', hex: '#f8f9fa' },
  { name: '--hs-dark', hex: '#1f232e' },

  // text
  { name: '--hs-text', hex: '#333333' },
  { name: '--hs-text-light', hex: '#e9e9e9' },
  { name: '--hs-text-dark', hex: '#222222' },

  { name: '--hs-body-bg', hex: '#ffffff' },
  { name: '--hs-body-color', hex: '#212529' },
  { name: '--hs-link-color', hex: '#0d6efd' },
  { name: '--hs-link-hover-color', hex: '#0a58ca' },
  { name: '--hs-code-color', hex: '#d63384' },
  { name: '--hs-highlight-bg', hex: '#fff3cd' }
];

export default () => {
   console.log('rgb root vars');
   colors
      .forEach((color) => {
         const rgb = Utils.hexToRgb(color.hex);
         console.log(`${color.name}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`);
      });

   console.log('\nmap color vars');
   colors
      .forEach((color) => {
         console.log(`${color.name.replace('--hs-', '')}: var(${color.name}),`);
      });

   console.log('\nmap rgb vars');
   colors
      .forEach((color) => {
         console.log(`${color.name.replace('--hs-', '')}: var(${color.name}-rgb),`);
      });

   console.log('\nexplorer constants');
   colors
      .forEach((color) => {
         const name = color.name.replace('--hs-', '');
         const templt = `{ label: '${name}', value: '${name}', hex: '${color.hex}' }`;
         console.log(`${templt},`);
      });

   console.log('\nlib color constants');
   colors
      .forEach((color) => {
         const name = color.name.replace('--hs-', '');
         const key = name.split('-').map(p => `${p.charAt(0).toUpperCase()}${p.substr(1, p.length)}`).join('');
         const templt = `${key}: { name: '${name}', hex: '${color.hex}' }`;
         console.log(`${templt},`);
      });
}
