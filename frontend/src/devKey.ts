let key: string | undefined = "[example]";
export function getKey() {
  return key;
}
export function setKey(newKey: string | undefined) {
  key = newKey;
}
