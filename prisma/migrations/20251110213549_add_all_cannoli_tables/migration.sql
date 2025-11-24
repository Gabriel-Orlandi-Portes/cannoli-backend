/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `containerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_fee` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `engineId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `engineName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `engineType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `extraInfo` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CampaignQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "storeInstanceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "sendAt" DATETIME NOT NULL,
    "status" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "createdAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedAt" DATETIME,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "segmentId" TEXT,
    "templateId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "badge" TEXT,
    "type" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedAt" DATETIME,
    "updatedBy" TEXT,
    "segmentName" TEXT,
    "storeName" TEXT,
    "templateName" TEXT
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "gender" TEXT,
    "dateOfBirth" DATETIME,
    "status" INTEGER NOT NULL,
    "externalCode" TEXT,
    "isEnriched" BOOLEAN,
    "createdAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedAt" DATETIME,
    "updatedBy" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "customerCity" TEXT,
    "customerState" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayId" TEXT,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "storeName" TEXT,
    "salesChannel" TEXT,
    "preparationStartDateTime" DATETIME,
    "deliveryDateTime" DATETIME,
    "preparationTime" REAL,
    "orderTiming" TEXT,
    "orderType" TEXT,
    "status" TEXT,
    "totalAmount" REAL,
    "deliveryFee" REAL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("companyId", "createdAt", "customerEmail", "customerId", "customerName", "displayId", "id", "orderTiming", "orderType", "preparationTime", "salesChannel", "status", "storeName", "updatedAt") SELECT "companyId", "createdAt", "customerEmail", "customerId", "customerName", "displayId", "id", "orderTiming", "orderType", "preparationTime", "salesChannel", "status", "storeName", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
