CREATE TABLE `BingoCards` (
	`card_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`group_id` text NOT NULL,
	`bingo_board` text NOT NULL,
	`bingo_count` integer DEFAULT 0 NOT NULL,
	`reach_count` integer DEFAULT 0 NOT NULL,
	`first_bingo_datetime` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`group_id`) REFERENCES `BingoGroups`(`group_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BingoGroups` (
	`group_id` text PRIMARY KEY NOT NULL,
	`group_name` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `GroupParticipants` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `BingoGroups`(`group_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
