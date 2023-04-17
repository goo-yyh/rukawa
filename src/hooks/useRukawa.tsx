import { useState, useEffect, useRef, useMemo } from 'react';
import { getRukawa } from "../rukawa";
import { INodeProps } from "../rukawa";
import { debounceTime } from 'rxjs';

interface IOptions<T> {
  debounce: number;
  formatResult: (values: T) => unknown;
}

interface IChangeDetail<T> {
  oldValues?: T;
  currentValues: T
}

export const useRukawa = <U = unknown, T = unknown>(
  { name, subscribes, initialValue }: INodeProps<U>,
  { debounce, formatResult }: IOptions<T>
) => {
  const rukawa = getRukawa();
  const nodeValues = rukawa.getNodeValues(subscribes || []);
  const [values, setValues] = useState(nodeValues);
  const valueDetail = useRef<IChangeDetail<T>>({
    currentValues: nodeValues as T
  });

  const operators = useMemo(() => {
    const pipe = [];
    if (debounce) {
      pipe.push(debounceTime(debounce));
    }

    return pipe;
  }, [debounce])

  useEffect(() => {
    const node = rukawa.createNode({
      name,
      subscribes,
      initialValue
    })
    if (initialValue !== undefined) {
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
      .pipe(...[operators])
      .subscribe((val) => {
        const keys = Object.keys(val as Record<string, unknown>);
        // values 中是否有订阅的 key
        let valueChanged = false;
        const changeValues = keys.reduce((cur, k) => {
          if (subscribes.includes(k)) {
            valueChanged = true;
            cur[k] = changeValues[k]
          }
          return cur;
        }, {} as Record<string, unknown>)
        if (valueChanged) {
          setValues(values => {
            const newValues = {
              ...values,
              ...changeValues
            }

            valueDetail.current = {
              oldValues: values as T,
              currentValues: newValues as T
            }

            return newValues;
          });
        }
      })
    return () => {
      rukawa.deleteNode(name);
      subscription.unsubscribe();
    }
  }, [name, subscribes]);

  return {
    rukawaValues: values,
    valuesDetail: valueDetail.current,
    setRukawaValue: (val: unknown) => {
      rukawa.rukawaMap[name].setValue(val)
    }
  }
}
