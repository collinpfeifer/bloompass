-- CreateTable
CREATE TABLE "User" (
    "id" STRING NOT NULL,
    "userNumber" INT8 NOT NULL DEFAULT unique_rowid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phoneNumber" STRING NOT NULL,
    "password" STRING NOT NULL,
    "image" STRING NOT NULL DEFAULT '',
    "name" STRING NOT NULL,
    "refreshToken" STRING,
    "balance" FLOAT8 NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userNumber_key" ON "User"("userNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
