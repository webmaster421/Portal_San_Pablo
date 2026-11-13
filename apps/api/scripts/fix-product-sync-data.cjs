const { PrismaClient } = require("@prisma/client");

(async () => {
  const p = new PrismaClient();
  const u1 = await p.product.update({
    where: { payloadId: 1 },
    data: { imageUrl: "/api/media/file/9788428573276_76983.png" },
  });
  const u2 = await p.product.update({
    where: { payloadId: 2 },
    data: {
      imageUrl: "/api/media/file/9789587688443_23891.png",
      categoryId: 25,
      categoryName: "Biblias",
    },
  });
  console.log(
    JSON.stringify(
      {
        u1: { id: u1.id, payloadId: u1.payloadId, imageUrl: u1.imageUrl, categoryId: u1.categoryId },
        u2: {
          id: u2.id,
          payloadId: u2.payloadId,
          imageUrl: u2.imageUrl,
          categoryId: u2.categoryId,
          categoryName: u2.categoryName,
        },
      },
      null,
      2,
    ),
  );
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
