import {addJsModule} from "../src";



test('sumPromise', () => {
  const result = addJsModule({
      name: 'test',
      loadUrls: ['123.js'],
  })
  expect(result).toEqual(true)
})