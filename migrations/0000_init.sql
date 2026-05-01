CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`currency` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`items_json` text NOT NULL,
	`payer_email` text,
	`payer_name` text,
	`capture_id` text,
	`email_sent_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`resource_id` text,
	`raw_json` text NOT NULL,
	`received_at` text NOT NULL,
	`processed_at` text,
	`error_message` text
);
