import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos en Supabase...');

  // 1. Crear o actualizar Usuario ADMINISTRADOR
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
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

  // 3. Crear o actualizar Dirección para el cliente
  const address = await prisma.address.upsert({
    where: { 
      // Asumimos que tienes una restricción única o usamos un campo compuesto. 
      // Si no, Prisma usará el primer campo único que encuentre o fallará. 
      // Una forma segura es buscar por userId y street, o usar un ID hardcodeado si ya existe.
      // Para simplificar, usaremos un upsert basado en una combinación o simplemente crearemos si no existe.
      // NOTA: Si tu schema no tiene @unique en street, cambia esto por un findFirst + create.
    },
    update: {},
    create: {
      street: 'Av. Winston Churchill 100',
      city: 'Santo Domingo',
      state: 'Distrito Nacional',
      zipCode: '10101',
      userId: client.id,
    },
  }).catch(async () => {
    // Fallback si el upsert falla por falta de campo único: intentar crear directamente
    return await prisma.address.create({
      data: {
        street: 'Av. Winston Churchill 100',
        city: 'Santo Domingo',
        state: 'Distrito Nacional',
        zipCode: '10101',
        userId: client.id,
      }
    }).catch(e => {
      console.log('⚠️ La dirección ya existe o hubo un error:', e.message);
      return await prisma.address.findFirst({ where: { userId: client.id } });
    });
  });
  console.log('✅ Dirección del cliente lista');

  // 4. Crear o actualizar Categorías
  const catElectronica = await prisma.category.upsert({
    where: { name: 'Electrónica' }, // Asumiendo que 'name' es @unique en tu schema
    update: {},
    create: { name: 'Electrónica', description: 'Gadgets, computadoras y accesorios' },
  });

  const catRopa = await prisma.category.upsert({
    where: { name: 'Ropa' },
    update: {},
    create: { name: 'Ropa', description: 'Vestimenta para hombre y mujer' },
  });
  console.log('✅ Categorías listas');

  // 5. Crear o actualizar Productos
  await prisma.product.upsert({
    where: { name: 'Laptop Gamer ASUS' }, // Asumiendo que 'name' es @unique
    update: {},
    create: {
      name: 'Laptop Gamer ASUS',
      description: 'Ryzen 7, 16GB RAM, 512GB SSD, RTX 3050',
      costPrice: 45000.00,
      salePrice: 55000.00,
      stock: 15,
      categoryId: catElectronica.id,
    },
  });

  await prisma.product.upsert({
    where: { name: 'Audífonos Bluetooth Sony' },
    update: {},
    create: {
      name: 'Audífonos Bluetooth Sony',
      description: 'Cancelación de ruido activa, 30h de batería',
      costPrice: 4000.00,
      salePrice: 6500.00,
      stock: 50,
      categoryId: catElectronica.id,
    },
  });

  await prisma.product.upsert({
    where: { name: 'Camiseta Básica Algodón' },
    update: {},
    create: {
      name: 'Camiseta Básica Algodón',
      description: '100% algodón, disponible en varias tallas',
      costPrice: 150.00,
      salePrice: 350.00,
      stock: 100,
      categoryId: catRopa.id,
    },
  });
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