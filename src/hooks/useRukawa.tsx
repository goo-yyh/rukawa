import { useState, useEffect, useMemo } from 'react';
import { getRukawa } from "../rukawa";
import { INodeProps } from "../rukawa";

export const useRukawa = ({ name, subscribes = [], initialValue }: INodeProps<unknown>) => {
  const rukawa = getRukawa();
  rukawa.createNode({
    name,
    subscribes,
    initialValue
  });
  const [values, setValues] =
    useState<Record<string, unknown>>(rukawa.getNodeValues(subscribes));

  useEffect(() => {
    rukawa.createNode({
      name,
      subscribes,
      initialValue
    })
    // 无订阅
    if (!subscribes.length) {
      return () => {}
    }

    const subscription = rukawa.stream.subscribe((val: Record<string, unknown>) => {
      setValues(values => ({
        ...values,
          val
      }));
    })
    return () => {
      rukawa.deleteNode(name);
      subscription.unsubscribe();
    }
  }, [name, subscribes]);

  const node = useMemo(() => {
    return rukawa.rukawaMap[name];
  }, [name])

  return {
    rukawaValues: values,
    setRukawaValue: node.setValue
  }
}
