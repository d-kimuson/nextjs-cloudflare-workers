CREATE TABLE `genres` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `makers` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `sample_large_images` (
	`workId` text,
	`imageUrl` text NOT NULL,
	`order` integer NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	PRIMARY KEY(`workId`, `order`),
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sample_small_images` (
	`workId` text,
	`imageUrl` text NOT NULL,
	`order` integer NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	PRIMARY KEY(`workId`, `order`),
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `work_genre` (
	`workId` text,
	`genreId` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	PRIMARY KEY(`workId`, `genreId`),
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`genreId`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_maker` (
	`workId` text,
	`makerId` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	PRIMARY KEY(`workId`, `makerId`),
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`makerId`) REFERENCES `makers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `work_series` (
	`workId` text,
	`seriesId` integer,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	PRIMARY KEY(`workId`, `seriesId`),
	FOREIGN KEY (`workId`) REFERENCES `works`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`seriesId`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `works` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`volume` integer,
	`reviewCount` integer,
	`reviewAverageScore` real,
	`affiliateUrl` text NOT NULL,
	`listImageUrl` text NOT NULL,
	`smallImageUrl` text,
	`largeImageUrl` text NOT NULL,
	`price` integer NOT NULL,
	`listPrice` integer NOT NULL,
	`releaseDate` text NOT NULL,
	`createdAt` text DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` text DEFAULT 'CURRENT_TIMESTAMP'
);
