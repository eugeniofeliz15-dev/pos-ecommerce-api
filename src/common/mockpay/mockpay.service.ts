import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MockPayService {
  private readonly apiUrl: string;
  private readonly secretKey: string;
  private readonly webhookUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('MOCKPAY_API_URL') || '';
    this.secretKey = this.configService.get<string>('MOCKPAY_SECRET_KEY') || '';
    this.webhookUrl = this.configService.get<string>('MOCKPAY_WEBHOOK_URL') || '';
  }

  async createPayment(amount: number, orderId: string, customerEmail: string) {
    try {
      const payload = {
        amount: amount,
        currency: 'DOP', // Cambia a 'USD' si tu proyecto usa dólares
        description: `Pago de orden ${orderId}`,
        order_id: orderId,
        webhook_url: this.webhookUrl, // Tu URL de webhook.site
        customer: {
          email: customerEmail,
        }
      };

      const response = await fetch(`${this.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la respuesta de MockPay');
      }

      const data = await response.json();
      
      // ⚠️ IMPORTANTE: Ajusta 'payment_url' si la documentación de MockPay 
      // devuelve el enlace con otro nombre (ej: 'url', 'checkout_url', 'link')
      return data.payment_url || data.url || data.checkout_url; 
    } catch (error) {
      console.error('❌ Error al crear pago en MockPay:', error);
      throw new InternalServerErrorException('Error al generar el enlace de pago con MockPay');
    }
  }
}