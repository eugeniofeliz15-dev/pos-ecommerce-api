import { PrismaClient, Role, PaymentMethod, OrderStatus, CashRegisterStatus } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Empezando a sembrar datos...');

  // 1. Limpiar base de datos (orden inverso a las dependencias)
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Crear Usuarios
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.create({
    data: { email: 'admin@tienda.com', password: hashedPassword, role: Role.ADMINISTRADOR, firstName: 'Carlos', lastName: 'Dueño' },
  });
  
  const cashier = await prisma.user.create({
    data: { email: 'cajero@tienda.com', password: hashedPassword, role: Role.CAJERO, firstName: 'María', lastName: 'García' },
  });

  const client = await prisma.user.create({
    data: { email: 'cliente@web.com', password: hashedPassword, role: Role.CLIENTE, firstName: 'Juan', lastName: 'Pérez', phone: '8095551234' },
  });

  // 3. Crear Dirección para el cliente
  const address = await prisma.address.create({
    data: { userId: client.id, street: 'Av. Siempre Viva 123', city: 'Santo Domingo', state: 'DN', zipCode: '10101', isDefault: true },
  });

  // 4. Crear Categorías y Productos
  const cat1 = await prisma.category.create({ data: { name: 'Electrónica', description: 'Gadgets' } });
  const cat2 = await prisma.category.create({ data: { name: 'Ropa', description: 'Vestimenta' } });

  const prod1 = await prisma.product.create({ data: { name: 'Audífonos BT', costPrice: 25.5, salePrice: 49.99, stock: 50, categoryId: cat1.id } });
  const prod2 = await prisma.product.create({ data: { name: 'Camiseta Negra', costPrice: 5.0, salePrice: 15.99, stock: 100, categoryId: cat2.id } });
  const prod3 = await prisma.product.create({ data: { name: 'Smartwatch', costPrice: 40.0, salePrice: 89.99, stock: 20, categoryId: cat1.id } });

  // 5. Crear Venta POS (Mostrador)
  const sale = await prisma.sale.create({
    data: {
      cashierId: cashier.id,
      totalAmount: 115.97, // (2 * 49.99) + 15.99
      paymentMethod: PaymentMethod.EFECTIVO,
      items: {
        create: [
          { productId: prod1.id, quantity: 2, unitPrice: 49.99, subtotal: 99.98 },
          { productId: prod2.id, quantity: 1, unitPrice: 15.99, subtotal: 15.99 },
        ],
      },
    },
  });

  // 6. Crear Pedido Web (E-commerce)
  const order = await prisma.order.create({
    data: {
      customerId: client.id,
      addressId: address.id,
      totalAmount: 89.99,
      status: OrderStatus.EN_CAMINO,
      notes: 'Dejar en recepción',
      items: {
        create: [
          { productId: prod3.id, quantity: 1, unitPrice: 89.99, subtotal: 89.99 },
        ],
      },
    },
  });

  // 7. Crear Caja Cerrada (Histórica)
  await prisma.cashRegister.create({
    data: {
      openedById: cashier.id,
      closedById: admin.id,
      openingBalance: 100.00,
      closingBalance: 215.97, // 100 inicial + 115.97 de la venta en efectivo
      expectedBalance: 215.97,
      difference: 0.00,
      status: CashRegisterStatus.CERRADA,
      openedAt: new Date(Date.now() - 86400000), // Ayer
      closedAt: new Date(),
    },
  });

  // 8. Crear Caja Abierta (Actual)
  await prisma.cashRegister.create({
    data: {
      openedById: cashier.id,
      openingBalance: 50.00,
      status: CashRegisterStatus.ABIERTA,
    },
  });

  console.log('✅ Datos sembrados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });