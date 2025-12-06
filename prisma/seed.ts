import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Customers
  const alice = await prisma.users.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      email: "alice@prisma.io",
      name: "Alice Customer",
      phone: "0812000111",
      address: "Jl. Setiabudi No. 10, Bandung",
    },
  });

  const bob = await prisma.users.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      email: "bob@prisma.io",
      name: "Bob Customer",
      phone: "0812000222",
      address: "Jl. Dago Pakar No. 5, Bandung",
    },
  });

  // Professional (mitra)
  const chandra = await prisma.users.upsert({
    where: { email: "chandra@tukangin.id" },
    update: {},
    create: {
      email: "chandra@tukangin.id",
      name: "Chandra Tukang",
      role: "DEVELOPER",
      phone: "0812000333",
      address: "Jl. Sukajadi No. 3, Bandung",
    },
  });

  await prisma.professionals.upsert({
    where: { userId: chandra.id },
    update: {},
    create: {
      userId: chandra.id,
      speciality: "AC",
      alamat: "Bandung",
      nikNumber: "3273123456780001",
      idCardPicture: "https://example.com/ktp/chandra",
    },
  });

  // Vouchers
  const percentVoucher = await prisma.vouchers.upsert({
    where: { code: "PERC10" },
    update: {},
    create: {
      code: "PERC10",
      type: "PERCENT",
      value: 10,
      maxDiscount: 25000,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      usageLimit: 3,
      isActive: true,
    },
  });

  const flatVoucher = await prisma.vouchers.upsert({
    where: { code: "FLAT50" },
    update: {},
    create: {
      code: "FLAT50",
      type: "FLAT",
      value: 50000,
      maxDiscount: 50000,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      usageLimit: 1,
      isActive: true,
    },
  });

  // Plan-aligned voucher
  const hematVoucher = await prisma.vouchers.upsert({
    where: { code: "HEMAT50" },
    update: {},
    create: {
      code: "HEMAT50",
      type: "PERCENT",
      value: 50,
      maxDiscount: 20000,
      expiryDate: null,
      usageLimit: 100,
      isActive: true,
    },
  });

  // Orders covering multiple states
  const orders = await prisma.orders.createMany({
    data: [
      {
        receiverName: "Alice",
        receiverPhone: "0812000111",
        category: "AC",
        service: "Cuci AC Split",
        address: "Jl. Setiabudi No. 10, Bandung",
        description: "AC kotor dan berisik",
        status: "PENDING",
        subtotal: 150000,
        discount: 0,
        total: 150000,
        userId: alice.id,
        attachments: [],
      },
      {
        receiverName: "Bob",
        receiverPhone: "0812000222",
        category: "Listrik",
        service: "Perbaikan MCB",
        address: "Jl. Dago Pakar No. 5, Bandung",
        description: "MCB sering turun",
        status: "PROCESSING",
        subtotal: 200000,
        discount: 20000,
        total: 180000,
        userId: bob.id,
        voucherId: percentVoucher.id,
        professionalId: chandra.id,
        attachments: [],
      },
      {
        receiverName: "Alice",
        receiverPhone: "0812000111",
        category: "AC",
        service: "Isi Freon",
        address: "Jl. Setiabudi No. 10, Bandung",
        description: "Freon habis",
        status: "COMPLETED",
        subtotal: 300000,
        discount: 50000,
        total: 250000,
        userId: alice.id,
        professionalId: chandra.id,
        completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        rating: 4.8,
        attachments: [],
      },
      {
        receiverName: "Bob",
        receiverPhone: "0812000222",
        category: "AC",
        service: "Perbaikan AC bocor",
        address: "Jl. Dago Pakar No. 5, Bandung",
        description: "AC menetes",
        status: "WARRANTY",
        subtotal: 180000,
        discount: 0,
        total: 180000,
        userId: bob.id,
        professionalId: chandra.id,
        attachments: [],
      },
    ],
    skipDuplicates: true,
  });

  // Retrieve created orders for warranty/review seeding
  const completedOrder = await prisma.orders.findFirst({
    where: { status: "COMPLETED", userId: alice.id },
  });

  // Seed Warranty (for Scenario 4.B & 4.D - Auto-generated warranty)
  if (completedOrder) {
    const existingWarranty = await prisma.warranties.findFirst({
      where: { orderId: completedOrder.id },
    });

    if (!existingWarranty) {
      await prisma.warranties.create({
        data: {
          orderId: completedOrder.id,
          userId: alice.id,
          professionalId: chandra.id,
          status: "ACTIVE",
          coverageType: "Standard Service Warranty",
          validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
          terms: "Garansi berlaku untuk kerusakan yang sama dalam 30 hari. Tidak termasuk kerusakan akibat kesalahan pengguna.",
        },
      });
    }
  }

  // Seed Review (for Scenario 4.C - Customer review after completion)
  if (completedOrder) {
    const existingReview = await prisma.reviews.findFirst({
      where: { orderId: completedOrder.id },
    });

    if (!existingReview) {
      await prisma.reviews.create({
        data: {
          orderId: completedOrder.id,
          userId: alice.id,
          professionalId: chandra.id,
          rating: 5,
          comment: "Pelayanan cepat dan rapi. Tukangnya ramah!",
          tags: ["Profesional", "Tepat Waktu", "Rapi"],
        },
      });
    }
  }

  console.log("Seeding complete:", {
    users: { alice: alice.id, bob: bob.id, chandra: chandra.id },
    vouchers: { percentVoucher: percentVoucher.id, flatVoucher: flatVoucher.id, hematVoucher: hematVoucher.id },
    orders: orders.count,
    warranty: completedOrder ? "Created" : "Skipped",
    review: completedOrder ? "Created" : "Skipped",
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
