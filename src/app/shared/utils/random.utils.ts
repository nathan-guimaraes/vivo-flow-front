export class RandomUtils {
  static uniqId(): string {
    return uuidv4();
  }
}

const regex = /[xy]/g;
const charRef = 'x';
const uuidv4Template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

const replaceFn = (c) => {
  const r = (Math.random() * 16) | 0;
  const v = c == charRef ? r : (r & 0x3) | 0x8;
  return v.toString(16);
};

function uuidv4() {
  return uuidv4Template.replace(regex, replaceFn);
}
