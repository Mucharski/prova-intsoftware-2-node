-- CreateTable
CREATE TABLE "Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scheduledTo" DATETIME NOT NULL,
    "restaurantName" TEXT NOT NULL,
    "restaurantId" INTEGER NOT NULL
);
