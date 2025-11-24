/*
  Warnings:

  - Made the column `customerEmail` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taxId" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" DATETIME,
    "status" INTEGER NOT NULL,
    "externalCode" TEXT,
    "isEnriched" BOOLEAN,
    "createdBy" TEXT NOT NULL,
    "updatedAt" DATETIME,
    "updatedBy" TEXT,
    "customerCity" TEXT,
    "customerState" TEXT
);
INSERT INTO "new_Customer" ("createdAt", "createdBy", "customerCity", "customerEmail", "customerPhone", "customerState", "dateOfBirth", "externalCode", "gender", "id", "isEnriched", "name", "status", "taxId", "updatedAt", "updatedBy") SELECT "createdAt", "createdBy", "customerCity", "customerEmail", "customerPhone", "customerState", "dateOfBirth", "externalCode", "gender", "id", "isEnriched", "name", "status", "taxId", "updatedAt", "updatedBy" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_customerEmail_key" ON "Customer"("customerEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
