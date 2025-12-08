type Payload = Record<string, unknown>;

class MockSignJWT {
  private payload: Payload;

  constructor(payload: Payload = {}) {
    this.payload = payload;
  }

  setProtectedHeader(): this {
    return this;
  }

  setExpirationTime(): this {
    return this;
  }

  setIssuedAt(): this {
    return this;
  }

  async sign(): Promise<string> {
    const serialized = JSON.stringify(this.payload);
    return `mock-signjwt.${Buffer.from(serialized).toString("base64url")}`;
  }
}

export { MockSignJWT as SignJWT };
