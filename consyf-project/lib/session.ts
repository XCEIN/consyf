export class ClientSession {
  private value: string | null;
  constructor() {
    this.value = null;
  }
  setValue(value: string) {
    this.value = value;
  }
  getValue() {
    return this.value;
  }
}

export const tokenClientSession:ClientSession = new ClientSession()