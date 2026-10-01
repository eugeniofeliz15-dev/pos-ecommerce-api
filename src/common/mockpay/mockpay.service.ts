import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MockPayService {
  constructor(private configService: ConfigService) {}

  async createPayment(amount: number, orderId: string): Promise<string> {
const apiUrl = this.configService.get<string>('MOCKPAY_API_URL') as string;
const apiKey = this.configService.get<string>('MOCKPAY_API_KEY') as string;   

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'USD',
          metadata: {
            order_id: orderId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`MockPay API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.checkout_url;
    } catch (error) {
      throw new InternalServerErrorException('Error al procesar el pago con MockPay');
    }
  }
}