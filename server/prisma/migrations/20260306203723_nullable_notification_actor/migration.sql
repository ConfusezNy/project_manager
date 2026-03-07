-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_actor_user_id_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "actor_user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "Users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;
