export class AfasClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    const env = process.env.AFAS_ENVIRONMENT;
    this.token = process.env.AFAS_TOKEN || "";
    this.baseUrl = `https://${env}.rest.afas.online/profitrestservices/connectors`;
  }

  private getHeaders(): Record<string, string> {
    const tokenXml = `<token><version>1</version><data>${this.token}</data></token>`;
    const encoded = Buffer.from(tokenXml).toString("base64");
    return {
      Authorization: `AfasToken ${encoded}`,
      "Content-Type": "application/json",
    };
  }

  async getConnector<T>(connectorId: string, params?: Record<string, string>): Promise<T[]> {
    const url = new URL(`${this.baseUrl}/${connectorId}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`AFAS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.rows || [];
  }

  isConfigured(): boolean {
    return !!(process.env.AFAS_ENVIRONMENT && process.env.AFAS_TOKEN);
  }
}

export const afasClient = new AfasClient();
