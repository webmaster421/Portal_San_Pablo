-- CreateTable
CREATE TABLE "BackendCheck" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackendCheck_pkey" PRIMARY KEY ("id")
);
