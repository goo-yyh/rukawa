import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getRukawa } from "../rukawa";
import { INodeProps } from "../rukawa";
import { debounceTime, filter, map, OperatorFunction } from 'rxjs';

interface IOptions<T> {
  debounce: number;
  formatResult: (values: T) => any;
  pipes: OperatorFunction<any, any>[];
  broadcastOnMounted: boolean;
  filterInvalidValue: boolean;
  ignoreSameValue: boolean;
  valueState: boolean;
}

interface IChangeDetail<T> {
  oldValues?: T;
  currentValues: T
}

export const useRukawa = <U = unknown, T = Record<string, unknown>>(
  { name, subscribes, initialValue }: INodeProps<U>,
  options?: Partial<IOptions<T>>
) => {
  const {
    debounce,
    formatResult,
    pipes,
    broadcastOnMounted = true,
    ignoreSameValue = false,
    valueState = false
  } = options || {};
  const rukawa = getRukawa();
  const nodeValues = rukawa.getNodeValues(subscribes || []);
  const [value, setValue] = useState<any>(valueState ? initialValue : undefined);
  const [values, setValues] = useState(nodeValues);
  // new values && old values
  const valueDetail = useRef<IChangeDetail<T>>({
    currentValues: nodeValues as T
  });

  // 处理无关数据
  const transformValues = useCallback((values: Record<string, unknown>) => {
    const keys = Object.keys(values);
    return keys.reduce((cur, k) => {
      if (subscribes!.includes(k)) {
        cur[k] = values[k]
      }
      return cur;
    }, {} as Record<string, unknown>)
  }, [subscribes])

  // rx pipe
  const operators = useMemo(() => {
    let pipe = [
      map(transformValues),
      filter((values: Record<string, unknown>) => !!Object.keys(values).length)
    ];
    if (debounce) {
      pipe.push(debounceTime(debounce));
    }

    if (pipes?.length) {
      pipe = [
        ...pipe,
        ...pipes
      ]
    }

    return pipe;
  }, [debounce, transformValues, pipes])

  useEffect(() => {
    const node = rukawa.createNode({
      name,
      subscribes,
      initialValue,
      ignoreSameValue
    })
    if (initialValue !== undefined && broadcastOnMounted) {
      node.setValue(initialValue);
    }
    // 无订阅
    if (!subscribes?.length) {
      return () => {
        rukawa.deleteNode(name);
      }
    }

    // @ts-ignore
    const subscription = rukawa
      .stream
      // @ts-ignore
      .pipe(...operators)
      .subscribe((val) => {
        setValues(values => {
          const newValues = {
            ...values,
            ...(val as Record<string, unknown>)
          }

          valueDetail.current = {
            oldValues: values as T,
            currentValues: newValues as T
          }

          return newValues;
        });
      })
    return () => {
      rukawa.deleteNode(name);
      subscription.unsubscribe();
    }
  }, [name]);

  const rukawaValues = useMemo(() => {
    if (formatResult) {
      return formatResult({
        ...values
      } as T);
    }
    return values;
  }, [formatResult, values])

  const setRukawaValue = useCallback((val: unknown) => {
    if (valueState) {
      setValue(val);
    }
    rukawa.rukawaMap[name].setValue(val);
  }, [])

  return {
    rukawaValues: rukawaValues,
    valuesDetail: valueDetail.current,
    setRukawaValue,
    value
  }
}
