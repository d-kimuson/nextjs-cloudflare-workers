CREATE TABLE `curated_makers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`makerId` integer NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`description` text,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`makerId`) REFERENCES `makers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `curated_makers_makerId_unique` ON `curated_makers` (`makerId`);