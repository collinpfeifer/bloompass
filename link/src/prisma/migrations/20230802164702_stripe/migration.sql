-- CreateTable
CREATE TABLE "Link" (
    "id" STRING NOT NULL,
    "linkNumber" INT8 NOT NULL DEFAULT unique_rowid(),
    "clicks" INT4 NOT NULL DEFAULT 0,
    "sales" INT4 NOT NULL DEFAULT 0,
    "postId" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "userStripeAccountId" STRING NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_id_key" ON "Link"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Link_linkNumber_key" ON "Link"("linkNumber");
