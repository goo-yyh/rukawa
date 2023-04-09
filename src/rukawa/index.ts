import { RukawaNode } from "../node";
import { Subject } from 'rxjs';
export interface INodeProps<T> {
  name: string;
  subscribes?: string[];
  initialValue?: T;
}

class Rukawa {
  rukawaMap: Record<string, RukawaNode<unknown>> = {};
  stream: Subject<{ name: string; value: unknown }> = new Subject();
  createNode(data: INodeProps<unknown>) {
    const { name } = data;
    if (this.rukawaMap[name]) {
      throw new Error(`rukawa 中已存在 name 为 ${name} 的节点`);
    }

    this.rukawaMap[name] = new RukawaNode<unknown>(data, this.stream);
  }

  deleteNode(name: string) {
    console.log('delete node', name);
    if (this.rukawaMap[name]) {
      Reflect.deleteProperty(this.rukawaMap, name);
    }
  }

  getNodeValues(names: string[]) {
    const values: Record<string, unknown> = {};
    names.forEach(name => {
      const node = this.rukawaMap[name];
      if (!node) {
        return;
      }
      values[name] = node.getValue()
    })
    return values;
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


