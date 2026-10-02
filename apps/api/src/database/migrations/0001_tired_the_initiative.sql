CREATE TABLE `project_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_amount` real DEFAULT 0,
	`invoice_id` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_milestones_org` ON `project_milestones` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_milestones_project` ON `project_milestones` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_milestones_status` ON `project_milestones` (`status`);--> statement-breakpoint
CREATE TABLE `project_scopes` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`included_items` text DEFAULT '[]',
	`excluded_items` text DEFAULT '[]',
	`limitations` text,
	`revision_allowance` integer DEFAULT 2 NOT NULL,
	`delivery_assumptions` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_scopes_org` ON `project_scopes` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_scopes_project` ON `project_scopes` (`project_id`);--> statement-breakpoint
CREATE TABLE `scope_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`request_details` text NOT NULL,
	`requested_by` text NOT NULL,
	`requested_date` text NOT NULL,
	`estimated_hours` real DEFAULT 0,
	`additional_cost` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`approved_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_scope_changes_org` ON `scope_changes` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_scope_changes_project` ON `scope_changes` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_scope_changes_status` ON `scope_changes` (`status`);--> statement-breakpoint
CREATE TABLE `asset_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`client_id` text,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'requested' NOT NULL,
	`due_date` text,
	`file_url` text,
	`file_name` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_asset_requests_org` ON `asset_requests` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_requests_project` ON `asset_requests` (`project_id`);--> statement-breakpoint
CREATE TABLE `business_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`period` text NOT NULL,
	`monthly_revenue_target` real DEFAULT 10000 NOT NULL,
	`target_clients` integer DEFAULT 3 NOT NULL,
	`target_hours` real DEFAULT 120 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_goals_org` ON `business_goals` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_goals_period` ON `business_goals` (`period`);--> statement-breakpoint
CREATE TABLE `case_studies` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`client_id` text,
	`title` text NOT NULL,
	`challenge` text NOT NULL,
	`solution` text NOT NULL,
	`result` text NOT NULL,
	`services` text DEFAULT '[]',
	`testimonial_text` text,
	`testimonial_author` text,
	`published` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_case_studies_org` ON `case_studies` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_case_studies_project` ON `case_studies` (`project_id`);--> statement-breakpoint
CREATE TABLE `equipment_items` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`item` text NOT NULL,
	`category` text DEFAULT 'Camera' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'needed' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_equipment_org` ON `equipment_items` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_equipment_project` ON `equipment_items` (`project_id`);--> statement-breakpoint
CREATE TABLE `production_call_sheets` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`shoot_date` text NOT NULL,
	`location` text NOT NULL,
	`call_times` text,
	`crew` text,
	`talent` text,
	`equipment` text,
	`notes` text,
	`emergency_contact` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_call_sheets_org` ON `production_call_sheets` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_call_sheets_project` ON `production_call_sheets` (`project_id`);--> statement-breakpoint
CREATE TABLE `production_shots` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`project_id` text NOT NULL,
	`shot_number` text NOT NULL,
	`description` text NOT NULL,
	`location` text,
	`framing` text,
	`movement` text,
	`lens` text,
	`talent` text,
	`notes` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_shots_org` ON `production_shots` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_shots_project` ON `production_shots` (`project_id`);