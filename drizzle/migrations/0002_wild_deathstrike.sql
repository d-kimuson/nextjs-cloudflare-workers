CREATE TABLE `maker_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`makerId` integer NOT NULL,
	`worksCount` integer DEFAULT 0 NOT NULL,
	`avgReviewScore` real,
	`avgReviewCount` real,
	`scoreVariance` real,
	`totalScore` real NOT NULL,
	`lastCalculatedAt` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`makerId`) REFERENCES `makers`(`id`) ON UPDATE no action ON DELETE no action
);
