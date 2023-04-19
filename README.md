# rukawa

[![NPM version](https://img.shields.io/npm/v/rukawa.svg?style=flat)](https://npmjs.org/package/rukawa)
[![NPM downloads](http://img.shields.io/npm/dm/rukawa.svg?style=flat)](https://npmjs.org/package/rukawa)

## 安装

```bash
$ npm install rukawa
```

## 简单使用

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
}, {
  debounce: 500
})
```

提供一个 `useRukawa` 的 `hook`，可以从中导出 `rukawaValues` 和 `setRukawaValue`,
`rukawaValues` 是订阅的节点的 `values` 集合, `setRukawaValue` 是更改当前节点的值,
更改后，订阅该值的节点中的 `rukawaValues`, 会获取到最新的值。

## API 介绍
`userukawa` 可以接受 2 个参数， `props` 和 `options`

### props

| 参数   | 说明     | 类型     | 必填 |
|------|--------|--------|----|
| name | 节点名称   | `string` | 是  |
| subscribes | 订阅节点名称 | `string[]` | 否  |
| initialValue | 节点初始值  | `any`  | 否  |

### options
| 参数   | 说明                    | 类型                | 默认值     |
|------|-----------------------|-------------------|---------|
| debounce | 防抖                    | `number`          | -       |
| formatResult | 对 `rukawaValue` 进行预处理 | `(values) => any` | -       |
| broadcastOnMounted | 初次挂载是否广播value         | `boolean`         | `true`  |
| ignoreSameValue | 是否忽略相同的值              | `boolean`         | `false` |
| valueState | 是否需要返回当前节点 value      | `boolean`         | `false` |
| pipes | rx pipes              | `OperatorFunction<any, any>[]`             | -       |

### return
| 参数   | 说明                       | 类型                             |
|------|--------------------------|--------------------------------|
| rukawaValues | 订阅节点值                    | `any`                          |
| valuesDetail | 当前值和上一次更改的值              | `{ currentValues, oldValues }` |
| setRukawaValue | 更改当前节点值                  | `(value) => void`              |
| value | 当前节点值（需要开启 `valueState`） | `any`                          |

### 其他
开启调试，可以看到每次值的传递。

```typescript jsx
import { getRukawa } from 'rukawa';

getRukawa().showValue();
```

## LICENSE

MIT
