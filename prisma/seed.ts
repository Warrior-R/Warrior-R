import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Electrónica", slug: "electronica", description: "Teléfonos, computadoras, gadgets y más" },
  { name: "Vehículos", slug: "vehiculos", description: "Carros, motos, camiones" },
  { name: "Inmuebles", slug: "inmuebles", description: "Casas, apartamentos, solares" },
  { name: "Ropa y Accesorios", slug: "ropa-accesorios", description: "Moda, calzado, joyería" },
  { name: "Electrodomésticos", slug: "electrodomesticos", description: "Lavadoras, neveras, Aires" },
  { name: "Deportes", slug: "deportes", description: "Equipos deportivos y fitness" },
  { name: "Hogar y Jardín", slug: "hogar-jardin", description: "Muebles, decoración, jardín" },
  { name: "Juguetes", slug: "juguetes", description: "Juguetes y juegos para niños" },
  { name: "Arte y Coleccionables", slug: "arte-coleccionables", description: "Obras de arte, antigüedades" },
  { name: "Servicios", slug: "servicios", description: "Servicios profesionales" },
  { name: "Animales y Mascotas", slug: "animales-mascotas", description: "Mascotas y accesorios" },
  { name: "General", slug: "general", description: "Otros artículos" },
];

async function main() {
  console.log("Seeding database...");

  // Create categories
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✓ Created ${CATEGORIES.length} categories`);

  // Create admin user
  const adminHash = await bcrypt.hash("Admin123!", 12);
  await prisma.user.upsert({
    where: { email: "admin@warriormarket.do" },
    update: {},
    create: {
      email: "admin@warriormarket.do",
      passwordHash: adminHash,
      firstName: "Admin",
      lastName: "WarriorMarket",
      role: "ADMIN",
      verificationStatus: "FULLY_VERIFIED",
      cedula: "001-0000001-1",
      country: "República Dominicana",
      province: "Distrito Nacional",
      city: "Santo Domingo",
    },
  });
  console.log("✓ Created admin user (admin@warriormarket.do / Admin123!)");

  // Create demo seller
  const sellerHash = await bcrypt.hash("Demo123!", 12);
  const seller = await prisma.user.upsert({
    where: { email: "vendedor@demo.do" },
    update: {},
    create: {
      email: "vendedor@demo.do",
      passwordHash: sellerHash,
      firstName: "Carlos",
      lastName: "Rodríguez",
      role: "SELLER",
      verificationStatus: "FULLY_VERIFIED",
      cedula: "001-1234567-8",
      country: "República Dominicana",
      province: "Santiago",
      city: "Santiago de los Caballeros",
      rating: 4.8,
      totalRatings: 125,
    },
  });
  console.log("✓ Created demo seller (vendedor@demo.do / Demo123!)");

  // Create demo products
  const electronics = await prisma.category.findUnique({ where: { slug: "electronica" } });
  const vehicles = await prisma.category.findUnique({ where: { slug: "vehiculos" } });
  const clothing = await prisma.category.findUnique({ where: { slug: "ropa-accesorios" } });

  if (electronics && vehicles && clothing) {
    // Fixed price products
    await prisma.product.upsert({
      where: { id: "demo-product-1" },
      update: {},
      create: {
        id: "demo-product-1",
        title: "iPhone 14 Pro Max 256GB Morado Espacial",
        description: "iPhone 14 Pro Max en perfectas condiciones. Desbloqueado para todas las redes. Incluye caja original, cargador y audífonos. Batería al 96%.",
        price: 75000,
        currency: "DOP",
        condition: "LIKE_NEW",
        listingType: "FIXED_PRICE",
        status: "ACTIVE",
        categoryId: electronics.id,
        sellerId: seller.id,
        province: "Santiago",
        aiTags: ["iphone", "apple", "smartphone", "celular", "telefono"],
        aiCategory: "Electrónica",
        views: 342,
        stock: 1,
      },
    });

    await prisma.product.upsert({
      where: { id: "demo-product-2" },
      update: {},
      create: {
        id: "demo-product-2",
        title: "Honda Civic 2020 Automático - Excelentes condiciones",
        description: "Honda Civic 2020, automático, 45,000 km. Un solo dueño. Bien cuidado, pintura original. Papeles al día, ITBIS y matricula pagos.",
        price: 1450000,
        currency: "DOP",
        condition: "GOOD",
        listingType: "FIXED_PRICE",
        status: "ACTIVE",
        categoryId: vehicles.id,
        sellerId: seller.id,
        province: "Distrito Nacional",
        aiTags: ["honda", "civic", "carro", "automático", "sedan"],
        aiCategory: "Vehículos",
        views: 891,
        stock: 1,
      },
    });

    // Auction product
    const auctionProduct = await prisma.product.upsert({
      where: { id: "demo-auction-1" },
      update: {},
      create: {
        id: "demo-auction-1",
        title: "MacBook Pro M3 16\" 512GB - SUBASTA",
        description: "MacBook Pro con chip M3, 16 pulgadas, 512GB SSD, 18GB RAM. En perfectas condiciones. Incluye cargador original.",
        price: 120000,
        currency: "DOP",
        condition: "LIKE_NEW",
        listingType: "AUCTION",
        status: "ACTIVE",
        categoryId: electronics.id,
        sellerId: seller.id,
        province: "Santo Domingo",
        aiTags: ["macbook", "apple", "laptop", "computadora", "m3"],
        aiCategory: "Electrónica",
        views: 1243,
        stock: 1,
      },
    });

    await prisma.auction.upsert({
      where: { productId: "demo-auction-1" },
      update: {},
      create: {
        productId: "demo-auction-1",
        startPrice: 80000,
        currentPrice: 95000,
        buyNowPrice: 150000,
        minBidStep: 1000,
        status: "ACTIVE",
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
    });

    console.log("✓ Created demo products");
  }

  console.log("\n✅ Database seeded successfully!");
  console.log("\nDemo accounts:");
  console.log("  Admin: admin@warriormarket.do / Admin123!");
  console.log("  Seller: vendedor@demo.do / Demo123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
