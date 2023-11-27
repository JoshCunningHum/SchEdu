export interface _colorItem{
  key: string;
  name: string;
  // light: boolean; 
}

export const useColorCollection = () : Array<_colorItem>=> {
  return [{
    key: 'DE6667',
    name: 'Red'
  }, {
    key: 'DF8538',
    name: 'Orange'
  }, {
    key: 'E0AD23',
    name: 'Amber'
  }, {
    key: 'E9C01A',
    name: 'Yellow'
  }, {
    key: '99D833',
    name: 'Lime'
  },
  {
    key: '2D9E61',
    name: 'Green',
  }, {
    key: '3FD398',
    name: 'Emerald'
  }, {
    key: '43D4BF',
    name: 'Teal'
  }, {
    key: '48D3EE',
    name: 'Cyan'
  }, {
    key: '44BDF8',
    name: 'Sky'
  },
  {
    key: '60A6FA',
    name: 'Blue'
  }, {
    key: '818CF8',
    name: 'Indigo'
  }, {
    key: 'A78BFB',
    name: 'Violet'
  }, {
    key: 'C084FC',
    name: 'Purple'
  }, {
    key: 'E879F9',
    name: 'Fuchsia'
  },
  {
    key: 'F472B6',
    name: 'Pink'
  }, {
    key: 'F67184',
    name: 'Rose'
  }];
}
