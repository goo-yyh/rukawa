import { INodeProps } from "../rukawa";

let id = 0;
export class RukawaNode<T = unknown> {
  _value: T | undefined;
  subscribes: string[];
  name: string;
  ignoreSameValue: boolean;
  broadcastOnMounted: boolean;
  setRukawaValue: (data: { name: string, value: T }) => void;
  id: number;
  constructor(data: INodeProps<T>, setRukawaValue: (data: { name: string, value: T }) => void) {
    this.subscribes = data.subscribes || [];
    this.name = data.name;
    this.id = ++id;
    this.ignoreSameValue = data.ignoreSameValue || false;
    this.broadcastOnMounted = data.broadcastOnMounted || false;
    this.setRukawaValue = setRukawaValue;

    if (data.initialValue !== undefined && this.broadcastOnMounted) {
      this.setValue(data.initialValue);
    } else {
      this._value = data.initialValue;
    }
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

  updateNode(setting: { key: 'subscribes', value: any }) {
    const { key, value } = setting;
    if (this[key] !== value) {
      this[key] = value;
    }
  }

  getValue() {
    return this._value;
  }
}
