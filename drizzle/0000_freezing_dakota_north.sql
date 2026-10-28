CREATE TABLE `project` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`project_detail` text DEFAULT '' NOT NULL,
	`customer` text NOT NULL,
	`customer_detail` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'lead' NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`closed_at` integer,
	`close_note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text,
	`updated_at` integer NOT NULL,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`due_date` text,
	`done_at` integer,
	`created_at` integer NOT NULL,
	`created_by` text,
	`updated_at` integer NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `task_project_id_idx` ON `task` (`project_id`);