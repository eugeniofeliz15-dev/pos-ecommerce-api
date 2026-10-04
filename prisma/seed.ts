import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos en Supabase...');

  // 1. Crear o actualizar Usuario ADMINISTRADOR
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: adminPassword,
      firstName: 'Administrador',
      lastName: 'Principal',
      phone: '8095550001',
      role: 'ADMINISTRADOR',
    },
  });
  console.log('✅ Usuario Administrador listo');

  // 2. Crear o actualizar Usuario CLIENTE
  const clientPassword = await bcrypt.hash('Client123!', 10);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: {
      email: 'cliente@demo.com',
      password: clientPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '8095550002',
      role: 'CLIENTE',
    },
  });
  console.log('✅ Usuario Cliente listo');

  // 3. Crear Dirección para el cliente (si no existe)
  let address = await prisma.address.findFirst({
    where: { userId: client.id }
  });

  if (!address) {
    address = await prisma.address.create({
      data: {
        street: 'Av. Winston Churchill 100',
        city: 'Santo Domingo',
        state: 'Distrito Nacional',
        zipCode: '10101',
        userId: client.id,
      },
    });
  }
  console.log('✅ Dirección del cliente lista');

  // 4. Crear o actualizar Categorías
  const catElectronica = await prisma.category.upsert({
    where: { name: 'Electrónica' }, 
    update: {},
    create: { name: 'Electrónica', description: 'Gadgets, computadoras y accesorios' },
  });

  const catRopa = await prisma.category.upsert({
    where: { name: 'Ropa' },
    update: {},
    create: { name: 'Ropa', description: 'Vestimenta para hombre y mujer' },
  });
  console.log('✅ Categorías listas');

  // 5. Crear Productos (si no existen)
  const prod1 = await prisma.product.findFirst({ where: { name: 'Laptop Gamer ASUS' } });
  if (!prod1) {
    await prisma.product.create({
      data: {
        name: 'Laptop Gamer ASUS',
        description: 'Ryzen 7, 16GB RAM, 512GB SSD, RTX 3050',
        costPrice: 45000.00,
        salePrice: 55000.00,
        stock: 15,
        categoryId: catElectronica.id,
      },
    });
  }

  const prod2 = await prisma.product.findFirst({ where: { name: 'Audífonos Bluetooth Sony' } });
  if (!prod2) {
    await prisma.product.create({
      data: {
        name: 'Audífonos Bluetooth Sony',
        description: 'Cancelación de ruido activa, 30h de batería',
        costPrice: 4000.00,
        salePrice: 6500.00,
        stock: 50,
        categoryId: catElectronica.id,
      },
    });
  }

  const prod3 = await prisma.product.findFirst({ where: { name: 'Camiseta Básica Algodón' } });
  if (!prod3) {
    await prisma.product.create({
      data: {
        name: 'Camiseta Básica Algodón',
        description: '100% algodón, disponible en varias tallas',
        costPrice: 150.00,
        salePrice: 350.00,
        stock: 100,
        categoryId: catRopa.id,
      },
    });
  }
  console.log('✅ Productos listos');

  console.log('🎉 ¡Seed completado con éxito en Supabase!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });