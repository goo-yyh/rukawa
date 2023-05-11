import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getRukawa } from "../rukawa";
import { INodeProps } from "../rukawa";
import { debounceTime, filter, map, OperatorFunction, Subscription} from 'rxjs';

interface IOptions<T> {
  debounce: number;
  formatResult: (values: T) => any;
  pipes: OperatorFunction<any, any>[];
  filterInvalidValue: boolean;
}

interface IChangeDetail<T> {
  oldValues?: T;
  currentValues: T
}

export const useRukawa = <U = unknown, T = Record<string, unknown>>(
  { name, subscribes, initialValue, broadcastOnMounted = true, ignoreSameValue = false, valueState = false }: INodeProps<U>,
  options?: Partial<IOptions<T>>
) => {

  const {
    debounce,
    formatResult,
    pipes
  } = options || {};

  const rukawa = getRukawa();
  const nodeValues = rukawa.getNodeValues(subscribes || []);
  const [value, setValue] = useState<any>(valueState ? initialValue : undefined);
  const [values, setValues] = useState(nodeValues);

  const isMounted = useRef(false);

  // subscription ref
  const subscriptionRef = useRef<null | Subscription>(null);

  // new values && old values
  const valueDetail = useRef<IChangeDetail<T>>({
    currentValues: nodeValues as T
  });

  // subscribes change, update stream
  // rx pipe
  const operators = useMemo(() => {
    if (!subscribes?.length) {
      return [];
    }

    let pipe = [
      // 清除无关数据
      map((values: Record<string, unknown>) => {
        const keys = Object.keys(values);
        return keys.reduce((cur, k) => {
          if (subscribes!.includes(k)) {
            cur[k] = values[k]
          }
          return cur;
        }, {} as Record<string, unknown>)
      }),
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
  }, [subscribes?.join(''), debounce, pipes])

  // resubscribe stream
  useEffect(() => {
    if (operators.length === 0) {
      return () => {}
    }

    subscriptionRef.current = rukawa
      .stream
      // @ts-ignore
      .pipe(...operators)
      .subscribe((val) => {
        setValues((values: T) => {
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
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [operators])

  // name change, recreate node
  useEffect(() => {
    const node = rukawa.createNode({
      name,
      subscribes,
      initialValue,
      ignoreSameValue,
      broadcastOnMounted
    })

    return () => {
      rukawa.deleteNode(name);
    }
  }, [name]);

  // change subscribes values when update
  useEffect(() => {
    if (isMounted.current) {
      const nodeValues = rukawa.getNodeValues(subscribes || []);
      setValues(nodeValues);
      rukawa.rukawaMap[name]?.updateNode({
        key: 'subscribes',
        value: subscribes
      })
    }
  }, [subscribes?.join('')])
  useEffect(() => {
    isMounted.current = true;
  }, [])

  // output values
  const rukawaValues = useMemo(() => {
    if (formatResult) {
      return formatResult({
        ...values
      });
    }
    return values;
  }, [formatResult, values])

  // tap stream
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
