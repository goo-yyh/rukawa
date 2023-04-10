# rukawa

[![NPM version](https://img.shields.io/npm/v/rukawa.svg?style=flat)](https://npmjs.org/package/rukawa)
[![NPM downloads](http://img.shields.io/npm/dm/rukawa.svg?style=flat)](https://npmjs.org/package/rukawa)

## Install

```bash
$ npm install rukawa
```

## use

```typescript jsx
import { useRukawa } from 'rukawa';

const {
  rukawaValues,
  setRukawaValue
} = useRukawa({
  name: 'test',
  subscribes: [
    'test-1'
  ],
  initialValue: ''
})
```

提供一个 `useRukawa` 的 `hook`，可以从中导出 `rukawaValues` 和 `setRukawaValue`,
`rukawaValues` 是订阅的节点的 `values` 集合, `setRukawaValue` 是更改当前节点的值,
更改后，订阅该值的节点中的 `rukawaValues`, 会获取到最新的值。

## LICENSE

MIT
