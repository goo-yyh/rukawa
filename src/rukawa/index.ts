import { RukawaNode } from "../node";
import { Subject } from 'rxjs';
export interface INodeProps<T> {
  name: string;
  subscribes?: string[];
  initialValue?: T;
  ignoreSameValue?: boolean;
  broadcastOnMounted?: boolean;
  valueState?: boolean;
}

class Rukawa {
  showNextValue = false;
  valueBucket: Record<string, unknown> = {};
  rukawaMap: Record<string, RukawaNode<unknown>> = {};
  stream: Subject<Record<string, unknown>> = new Subject();
  createNode(data: INodeProps<unknown>) {
    const { name } = data;
    if (this.rukawaMap[name]) {
      throw new Error(`rukawa 中已存在 name 为 ${name} 的节点`);
    }

    this.rukawaMap[name] = new RukawaNode<unknown>(data, this.setNodeValue.bind(this));
    return this.rukawaMap[name];
  }

  setNodeValue(data: { name: string, value: unknown }) {
    this.valueBucket = {
      ...this.valueBucket,
      [data.name]: data.value
    }

    Promise.resolve()
      .then(() => {
        if (this.showNextValue) {
          try {
            console.log('rukawa next value: ' + JSON.stringify(this.valueBucket));
          } catch (e) {
            console.warn('next value cannot stringify');
          }
        }
        this.stream.next({
          ...this.valueBucket
        });
        this.valueBucket = {};
      })
  }

  deleteNode(name: string) {
    if (this.rukawaMap[name]) {
      Reflect.deleteProperty(this.rukawaMap, name);
    }
  }

  getNodeValues(names: string[]) {
    const values: Record<string, unknown> = {};
    names.forEach(name => {
      const node = this.rukawaMap[name];
      if (!node) {
        values[name] = undefined;
        return;
      }
      values[name] = node.getValue()
    })
    return values;
  }
  getNodeValue(name: string) {
    return this.rukawaMap[name]?.getValue();
  }

  getNode(name: string) {
    return this.rukawaMap[name];
  }
  getAllNodes() {
    return {
      ...this.rukawaMap
    }
  }

  showValue() {
    this.showNextValue = true;
  }
}

let rukawa: Rukawa;
export const getRukawa = () => {
  if (rukawa) {
    return rukawa;
  }
  rukawa = new Rukawa();
  return rukawa;
}


