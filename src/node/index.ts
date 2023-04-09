import { Subject } from "rxjs";
import { INodeProps } from "../rukawa";

let id = 0;
export class RukawaNode<T> {
  _value: unknown;
  subscribes: string[];
  name: string;
  subject: Subject<{ name: string; value: unknown }>;
  id: number;
  constructor(data: INodeProps<T>, subject: Subject<{ name: string; value: unknown }>) {
    this._value = data.initialValue;
    this.subscribes = data.subscribes || [];
    this.name = data.name;
    this.subject = subject;
    this.id = ++id;
  }

  setValue(value: T) {
    this._value = value;
    this.subject.next({
      name: this.name,
      value: value
    })
  }

  getValue() {
    return this._value;
  }
}
