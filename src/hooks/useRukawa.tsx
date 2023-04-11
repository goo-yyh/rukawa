import { useState, useEffect, useRef } from 'react';
import { getRukawa } from "../rukawa";
import { INodeProps } from "../rukawa";

export const useRukawa = ({ name, subscribes, initialValue }: INodeProps<unknown>) => {
  const rukawa = getRukawa();
  const nodeValues = rukawa.getNodeValues(subscribes || []);
  const [values, setValues] = useState(nodeValues);
  const currentValues = useRef(nodeValues);

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

    const subscription = rukawa.stream.subscribe((val) => {
      const { name, value } = val;
      if (subscribes.includes(name)) {
        setValues(values => ({
          ...values,
          [name]: value
        }));
      }
    })
    return () => {
      rukawa.deleteNode(name);
      subscription.unsubscribe();
    }
  }, [name, subscribes]);

  return {
    rukawaValues: values,
    setRukawaValue: (val: unknown) => {
      rukawa.rukawaMap[name].setValue(val)
    }
  }
}
