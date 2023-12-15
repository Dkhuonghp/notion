ALTER TABLE "files" ADD COLUMN "published" boolean;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "published" boolean;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "published" boolean;--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN IF EXISTS "isPublished";