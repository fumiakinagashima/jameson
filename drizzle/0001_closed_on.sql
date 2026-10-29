ALTER TABLE `project` ADD `closed_on` text;--> statement-breakpoint
UPDATE `project` SET `closed_on` = strftime('%Y-%m-%d', `closed_at` / 1000, 'unixepoch') WHERE `closed_at` IS NOT NULL;--> statement-breakpoint
ALTER TABLE `project` DROP COLUMN `closed_at`;
