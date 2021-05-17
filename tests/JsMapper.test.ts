import { expect } from 'chai'

import JsMapper from '@/JsMapper'

import JsMap from '@/JsMap'
import JsMapInjector from '@/injector/JsMapInjector'

const toUpperCase = (value: unknown) => {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }

  throw new Error('value must be a string')
}

describe('JsMapper', () => {
  test('mapping by route', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('id', '_id')
        .route('name', '_name')
      )

    const film = mapper.map('FilmPayload', {
      _id: 1,
      _name: 'Star Wars. Episode IV: A New Hope',
    })

    expect(film).to.deep.equal({
      id: 1,
      name: 'Star Wars. Episode IV: A New Hope',
    })
  })

  test('mapping by route when path not reachable', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('id', '_id')
        .route('name', '_name')
      )

    expect(() => mapper.map('FilmPayload', {
      _id: 1,
    })).to.throw('[cmath10/js-mapper] Path _name is not reachable in the source')
  })

  test('mapping by route with fallback', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('id', '_id')
        .route('name', '_name', '%not present%')
      )

    const film = mapper.map('FilmPayload', {
      _id: 1,
      _name: 'Star Wars. Episode IV: A New Hope',
    })

    expect(film).to.deep.equal({
      id: 1,
      name: 'Star Wars. Episode IV: A New Hope',
    })
  })

  test('mapping by route with fallback when path not reachable', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('id', '_id')
        .route('name', '_name', '%not present%')
      )

    const film = mapper.map('FilmPayload', {
      _id: 1,
    })

    expect(film).to.deep.equal({
      id: 1,
      name: '%not present%',
    })
  })

  test('mapping by deep route', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('studio', '_studio.name')
      )

    const film = mapper.map('FilmPayload', {
      _studio: { name: 'Lucasfilm Ltd. LLC' },
    })

    expect(film).to.deep.equal({
      studio: 'Lucasfilm Ltd. LLC',
    })
  })

  test('mapping with callback extractor', () => {
    type FilmPayload = {
      _studio: {
        name: string;
      };
    }

    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .forMember('studio', (source: unknown) => (source as FilmPayload)._studio.name)
      )

    const film = mapper.map('FilmPayload', {
      _studio: { name: 'Lucasfilm Ltd. LLC' },
    })

    expect(film).to.deep.equal({
      studio: 'Lucasfilm Ltd. LLC',
    })
  })

  test('mapping with callback filter', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('name', '_name')
        .filter('name', toUpperCase)
      )

    const film = mapper.map('FilmPayload', {
      _name: 'Star Wars. Episode IV: A New Hope',
    })

    expect(film).to.deep.equal({
      name: 'STAR WARS. EPISODE IV: A NEW HOPE',
    })
  })

  test('mapping with filter chain', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('name', '_name')
        .filter('name', [
          toUpperCase,
          (value: unknown) => '<<' + value + '>>',
        ])
      )

    const film = mapper.map('FilmPayload', {
      _name: 'Star Wars. Episode IV: A New Hope',
    })

    expect(film).to.deep.equal({
      name: '<<STAR WARS. EPISODE IV: A NEW HOPE>>',
    })
  })

  test('mapping with nested filter chain', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('name', '_name')
        .filter('name', [
          toUpperCase,
          [
            (value: unknown) => '<' + value + '>',
            (value: unknown) => '<' + value + '>',
          ],
        ])
      )

    const film = mapper.map('FilmPayload', {
      _name: 'Star Wars. Episode IV: A New Hope',
    })

    expect(film).to.deep.equal({
      name: '<<STAR WARS. EPISODE IV: A NEW HOPE>>',
    })
  })

  test('nested mapping', () => {
    const mapper = new JsMapper()
      .set('StudioPayload',new JsMap()
        .route('name', '_name')
      )
      .set('FilmPayload', new JsMap()
        .route('studio', '_studio')
        .filter('studio', 'StudioPayload')
      )

    const film = mapper.map('FilmPayload', {
      _id: 1,
      _name: 'Star Wars. Episode IV: A New Hope',
      _studio: { _name: 'Lucasfilm Ltd. LLC' },
    })

    expect(film).to.deep.equal({
      studio: { name: 'Lucasfilm Ltd. LLC' },
    })
  })

  test('array mapping', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('id', '_id')
        .route('name', '_name')
      )

    const collection = mapper.map('[FilmPayload]', [{
      _id: 1,
      _name: 'Star Wars. Episode IV: A New Hope',
    }, {
      _id: 6,
      _name: 'Star Wars. Episode III. Revenge of the Sith',
    }])

    expect(collection).to.deep.equal([{
      id: 1,
      name: 'Star Wars. Episode IV: A New Hope',
    }, {
      id: 6,
      name: 'Star Wars. Episode III. Revenge of the Sith',
    }])
  })

  test('nested array mapping', () => {
    const mapper = new JsMapper()
      .set('StudioPayload', new JsMap()
        .route('name', '_name')
      )
      .set('FilmPayload', new JsMap()
        .route('id', '_id')
        .route('name', '_name')
      )
      .set('FilmCollectionPayload', new JsMap()
        .route('studio', '_studio')
        .filter('studio', 'StudioPayload')
        .route('films', '_films')
        .filter('films', '[FilmPayload]')
      )

    const collection = mapper.map('FilmCollectionPayload', {
      _studio: { _name: 'Lucasfilm Ltd. LLC' },
      _films: [{
        _id: 1,
        _name: 'Star Wars. Episode IV: A New Hope',
      }, {
        _id: 6,
        _name: 'Star Wars. Episode III. Revenge of the Sith',
      }],
    })

    expect(collection).to.deep.equal({
      studio: { name: 'Lucasfilm Ltd. LLC' },
      films: [{
        id: 1,
        name: 'Star Wars. Episode IV: A New Hope',
      }, {
        id: 6,
        name: 'Star Wars. Episode III. Revenge of the Sith',
      }],
    })
  })

  test('array mapping when source is not an array', () => {
    const mapper = new JsMapper()
      .set('FilmPayload', new JsMap()
        .route('id', '_id')
        .route('name', '_name')
      )

    expect(() => mapper.map('[FilmPayload]', {
      _id: 1,
      _name: 'Star Wars. Episode IV: A New Hope',
    })).to.throw('[cmath10/js-mapper] For array maps source must be an array')
  })

  test('mapping by setter', () => {
    const date = new Date()
    const mapper = new JsMapper()
      .set('DatePayload', new JsMap(() => new Date())
        .route('setHours', 'hours')
        .route('setMinutes', 'minutes')
      )

    date.setHours(0, 0)
    mapper.map('DatePayload', {
      hours: 10,
      minutes: 30,
    }, date)

    expect(date.getHours()).to.equal(10)
    expect(date.getMinutes()).to.equal(30)
  })

  test('mapping by custom injector', () => {
    const date = new Date()
    const mapper = new JsMapper()
      .set('DatePayload', new JsMap()
        .destination(() => new Date())
        .route('setHours', 'hours')
        .route('minutes', 'minutes')
        .inject('minutes', new class extends JsMapInjector {
          inject(destination: unknown, path: string, value: unknown) {
            if (destination instanceof Date && typeof value === 'number') {
              destination.setMinutes(value)
            }
          }
        })
      )

    date.setHours(0, 0)
    mapper.map('DatePayload', {
      hours: 10,
      minutes: 30,
    }, date)

    expect(date.getHours()).to.equal(10)
    expect(date.getMinutes()).to.equal(30)
  })
})
