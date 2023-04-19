import { INodeProps } from "../rukawa";

let id = 0;
export class RukawaNode<T = unknown> {
  _value: T | undefined;
  subscribes: string[];
  name: string;
  ignoreSameValue = false;
  setRukawaValue: (data: { name: string, value: T }) => void;
  id: number;
  constructor(data: INodeProps<T>, setRukawaValue: (data: { name: string, value: T }) => void) {
    this._value = data.initialValue;
    this.subscribes = data.subscribes || [];
    this.name = data.name;
    this.id = ++id;
    this.setRukawaValue = setRukawaValue;
  }

  setValue(value: T) {
    if (this.ignoreSameValue && this._value === value) {
      return;
    }

    this._value = value;
    this.setRukawaValue({
      name: this.name,
      value: value
    })
  }

  getValue() {
    return this._value;
  }
}
