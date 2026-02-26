export class ClientSession {
  private value: string | null;
  constructor() {
    this.value = null;
  }
  setValue(value: string) {
    this.value = value;
  }
  getValue() {
    // Luôn lấy từ localStorage để có token mới nhất
    if (typeof window !== 'undefined') {
      const tokenFromStorage = localStorage.getItem('token');
      if (tokenFromStorage) {
        return tokenFromStorage;
      }
    }
    return this.value;
  }
}

export const tokenClientSession: ClientSession = new ClientSession()