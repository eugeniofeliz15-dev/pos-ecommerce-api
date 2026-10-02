import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Flujo Completo E2E - POS & E-commerce', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let clientToken: string;
  let categoryId: number;
  let productId: number;
  let cashRegisterId: number;
  let orderId: number;
  let saleId: number;
  let addressId: number; // 👈 NUEVO: Para guardar el ID de la dirección de prueba

  const testAdmin = {
    email: `test-admin-${Date.now()}@tienda.com`,
    password: 'Admin123!',
    firstName: 'Test',
    lastName: 'Admin',
    phone: '8090000000',
  };

  const testClient = {
    email: `test-client-${Date.now()}@tienda.com`,
    password: 'Client123!',
    firstName: 'Cliente',
    lastName: 'Prueba',
    phone: '8091111111',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // 🧹 LIMPIEZA AUTOMÁTICA (Orden inverso)
    if (saleId) await prisma.sale.delete({ where: { id: saleId } }).catch(() => {});
    if (orderId) await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
    if (cashRegisterId) await prisma.cashRegister.delete({ where: { id: cashRegisterId } }).catch(() => {});
    if (productId) await prisma.product.delete({ where: { id: productId } }).catch(() => {});
    if (categoryId) await prisma.category.delete({ where: { id: categoryId } }).catch(() => {});
    if (addressId) await prisma.address.delete({ where: { id: addressId } }).catch(() => {}); // 👈 Limpieza de dirección
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test-admin-' } } }).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test-client-' } } }).catch(() => {});
    
    await app.close();
  });

  it('1. Debe registrar un usuario ADMIN y devolver un token', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/register').send(testAdmin).expect(201);
    await prisma.user.update({ where: { email: testAdmin.email }, data: { role: 'ADMINISTRADOR' } });
  });

  it('2. Debe iniciar sesión como ADMIN correctamente', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testAdmin.email, password: testAdmin.password })
      .expect(201);
    adminToken = response.body.access_token;
  });

  it('3. Debe registrar un usuario CLIENTE y devolver un token', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(testClient).expect(201);
  });

  it('4. Debe iniciar sesión como CLIENTE correctamente', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testClient.email, password: testClient.password })
      .expect(201);
    clientToken = response.body.access_token;
  });

  it('5. Debe crear una categoría (ADMIN)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Categoría E2E ${Date.now()}`, description: 'Test' })
      .expect(201);
    categoryId = response.body.id;
  });

  it('6. Debe crear un producto (ADMIN)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto E2E', description: 'Test', costPrice: 50, salePrice: 100, stock: 20, categoryId })
      .expect(201);
    productId = response.body.id;
  });

  it('7. Debe abrir una caja registradora (ADMIN)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/cash-register/open')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ openingBalance: 1000 })
      .expect(201);
    cashRegisterId = response.body.id;
  });

  it('8. Debe agregar un producto al carrito (CLIENTE)', async () => {
    await request(app.getHttpServer())
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId: productId, quantity: 2 })
      .expect(201); // O 200
  });

  it('9. Debe listar el carrito del usuario (CLIENTE)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/cart')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);
    
    const cartData = response.body.items || response.body.cart || response.body;
    expect(cartData).toBeDefined();
  });

  // 👇 PASO NUEVO: Crear una dirección válida para el checkout
  it('9.5. Debe crear una dirección de prueba para el cliente', async () => {
    const clientUser = await prisma.user.findUnique({ where: { email: testClient.email } });
    
    const newAddress = await prisma.address.create({
      data: {
        street: 'Calle de Prueba 123',
        city: 'Santo Domingo',
        state: 'Distrito Nacional',
        zipCode: '10000', // 👈 ¡ESTE ERA EL ÚLTIMO CAMPO FALTANTE!
        userId: clientUser!.id, 
      }
    });
    addressId = newAddress.id;
  });

 it('10. Debe procesar el Checkout / Crear Orden (CLIENTE)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ 
        paymentMethod: 'EFECTIVO', 
        addressId: addressId
      });
    
    if (response.status !== 201 && response.status !== 200) {
      console.log('❌ ERROR EN CHECKOUT:', response.body);
    }
    expect(response.status).toBe(201); // O 200
    orderId = response.body.id;
  });

  it('11. Debe registrar una Venta POS (ADMIN)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [{ productId: productId, quantity: 1, salePrice: 100 }],
        total: 100,
        paymentMethod: 'EFECTIVO'
      })
      .expect(201);
    saleId = response.body.id;
  });

  it('12. Debe cerrar la caja registradora (ADMIN)', async () => {
    await request(app.getHttpServer())
      .post('/api/cash-register/close')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ closingBalance: 1100 })
      .expect(201);
  });
});