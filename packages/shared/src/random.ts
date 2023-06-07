
const chars = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  

  let records = [];
  export function generateMixed(n = 10) {
    var res = '';
    for (var i = 0; i < n; i++) {
      var id = Math.ceil(Math.random() * (chars.length - 1));
      res += chars[id];
    }

    if (records.includes(res)) res = generateMixed(n);
    return res;
  }
  