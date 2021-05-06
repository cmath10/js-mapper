# JsMapper - JavaScript mapping helper

The component helps transform objects into each other by reusable maps. One of the main use cases -
converting JSON API responses into appropriate form.

Usage example:

```javascript
import JsMapper, { JsMap } from '@cmath10/js-mapper'

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
```

result is
```json
{
  "studio": { "name": "Lucasfilm Ltd. LLC" },
  "films": [{
    "id": 1,
    "name": "Star Wars. Episode IV: A New Hope"
  }, {
    "id": 6,
    "name": "Star Wars. Episode III. Revenge of the Sith"
  }]
}
```

## Installation

```bash
yarn add @cmath10/js-mapper
```

or

```bash
npm i @cmath10/js-jmapper
```

## API

JsMapper - helper class that maps objects:
```javascript
import JsMapper from '@cmath10/js-mapper'
```
Methods:
* `map(typeOrMap, source, destination = undefined)` &mdash; maps source object to destination object, if destination
  object not specified, it will be created; you are also able to supply map instance instead of map type to use map
  without registration;
* `set(type, map)` &mdash; sets map instance by type name (adds if type name not registered yet);
* `get(type, clone = true)` &mdash; returns map instance by type name, if flag `clone` is set will return copy of map;
* `unset(type)` &mdash; removes map by type name from mapper instance;

__Important note__: you are able to map arrays of objects with `map` method, just register a map for single object with
a name for example `MapTypeName` and use method like `mapper.map('[MapTypeName]', %array of objects%)`

JsMap - map class, accumulates mapping information:
```javascript
import { JsMap } from '@cmath10/js-mapper'
```
* `destination(destination)` &mdash; sets factory for a destination, default factory is `() => ({})`;
* `route(destinationMember, sourceMember)` &mdash; sets path extractor by source member; source member could be a deep
  route like `path.to.source.property`;
* `forMember(destinationMember, extractor)` &mdash; sets a custom extractor for a destination member;
* `filter(destinationMember, filter)` &mdash; sets a custom filter for value processing;
* `inject(destinationMember, injector)` &mdash; sets a custom injector for a destination member;
* `exclude(destinationMember)` &mdash; removes destination member from a map;
* `clone()` &mdash; creates copy of map;

### Extractors

Extractors are used for extracting value from a source. Available extractors:
```javascript
import {
  JsMapCallbackExtractor,
  JsMapExtractor,
  JsMapPathExtractor,
} from '@cmath10/js-mapper'
```

#### JsMapExtractor
`JsMapExtractor` is the basic extractor class. Extracts nothing, just throws an error (like abstract class without
implementation). All other extractors should extend this class and implement its `extract` method.

#### JsMapPathExtractor
Extracts value from source by property path. Throws an error if path is not valid. Used by default.

#### JsMapCallbackExtractor
Extracts value by callback function like `(source: unknown) => unknown`:
```javascript
const mapper = new JsMapper()
  .set('Demo', new JsMap()
    .forMember('text', new JsMapCallbackExtractor(source => source._text))
  )

mapper.map('Demo', { _text: 'text' }) // { text: 'text' }
```
Sugar:
```javascript
const map = new JsMap()
  .forMember('text', source => source._text)
```

### Filters

Filters are used for processing value before injecting it into a destination. Available filters:

```javascript
import {
  JsMapCallbackFilter,
  JsMapFilter,
  JsMapFilterChain,
  JsMapMappingFilter,
} from '@cmath10/js-mapper'
```

#### JsMapFilter
`JsMapFilter` is the basic filter class, that used by default and actually just returns source value. `JsMapper`
instance is being injected into each `JsMapFilter` instance, so it is possible to create filters with complicated
processing chains with nested mapping. All other filters should extend this class.

#### JsMapCallbackFilter
This is a simple filter is using a callback function to process value:
```javascript
const mapper = new JsMapper()
  .set('Demo', new JsMap()
    .route('text', 'text')
    .filter('text', new JsMapCallbackFilter(value => {
      if (typeof value === 'string') {
        return value.toUpperCase()
      }

      throw new Error()
    }))
  )

mapper.map('Demo', { text: 'text' }) // { text: 'TEXT' }
```
Callback function is presumed as `(value: unknown) => unknown`. Sugar:
```javascript
const map = new JsMap()
    .route('text', 'text')
    .filter('text', value => {
      if (typeof value === 'string') {
        return value.toUpperCase()
      }

      throw new Error()
    })
```

#### JsMapMappingFilter
This filter is using map type to apply maps to a value (nested mapping opportunity):
```javascript
const mapper = new JsMapper()
  .set('FilmPayload', new JsMap()
    .route('id', '_id')
    .route('name', '_name')
  )
  .set('Demo', new JsMap()
    .route('film', '_film')
    .filter('film', new JsMapMappingFilter('FilmPayload'))
  )

mapper.map('Demo', { _film: {
  _id: 1,
  _name: 'Star Wars. Episode IV: A New Hope',
} }) // { film: { id: 1, name: 'Star Wars. Episode IV: A New Hope' } }
```
Sugar:
```javascript
const map = new JsMap()
    .route('film', '_film')
    .filter('film', 'FilmPayload')
```

#### JsMapFilterChain
This filter provides opportunity to create filtering pipelines:
```javascript
const mapper = new JsMapper()
  .set('FilmPayload', new JsMap()
    .route('id', '_id')
    .route('name', '_name')
    .filter('name', new JsMapFilterChain([
      new JsMapCallbackFilter(value => value.toUpperCase()),
      new JsMapCallbackFilter(value => '<<' + value + '>>'),
    ]))
  )
  .set('Demo', new JsMap()
    .route('film', '_film')
    .filter('film', new JsMapFilterChain([
      new JsMapMappingFilter('FilmPayload'),
      new JsMapCallbackFilter(value => value.name)
    ]))
  )

mapper.map('Demo', { _film: {
  _id: 1,
  _name: 'Star Wars. Episode IV: A New Hope',
} }) // { film: '<<STAR WARS. EPISODE IV: A NEW HOPE>>' }
```
Sugar:
```javascript
const mapper = new JsMapper()
  .set('FilmPayload', new JsMap()
    .route('id', '_id')
    .route('name', '_name')
    .filter('name', [
      value => value.toUpperCase(),
      value => '<<' + value + '>>',
    ])
  )
  .set('Demo', new JsMap()
    .route('film', '_film')
    .filter('film', ['FilmPayload', film => film.name])
  )
```

### Injectors

Injectors are used for injecting a processed value into destination object. Available injectors:

```javascript
import {
  JsMapInjector,
} from '@cmath10/js-mapper'
```

`JsMapInjector` is the basic injector class, that used by default. It uses destination member name as property key.
If property is function, it will be used as setter (i.e. called with destination as new `this` and value as parameter).
All other injectors should extend this class.

Setter example:
```javascript
const mapper = new JsMapper()
  .set('DatePayload', new JsMap()
    .destination(() => new Date())
    .route('setHours', 'hours')
  )

mapper.map({ hours: 0 }).getHours() // 0
mapper.map({ hours: 1 }).getHours() // 1
```

Custom injector example:
```javascript
const mapper = new JsMapper()
  .set('DatePayload', new JsMap()
    .destination(() => new Date())
    .route('hours', 'hours')
    .inject('hours', new class extends JsMapInjector {
      inject(destination, path, value): void {
        destination.setHours(value)
      }
    })
  )

mapper.map({ hours: 0 }).getHours() // 0
mapper.map({ hours: 1 }).getHours() // 1
```
