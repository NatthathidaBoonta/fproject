-- ====================================================================
-- GRADUATION REQUEST SYSTEM - DATABASE SCHEMA
-- Compatible with SQLite, MySQL, and other standard SQL engines.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Table: Users
-- Holds authentication and profile information for all roles.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Users` (
    `id` VARCHAR(255) PRIMARY KEY,                             -- e.g. "S1101", "A1101", "admin"
    `name` VARCHAR(255) NOT NULL,                              -- User's full name
    `email` VARCHAR(255) NOT NULL UNIQUE,                      -- User's email (must be unique)
    `password` VARCHAR(255) NOT NULL,                          -- PBKDF2 hashed password
    `role` VARCHAR(50) NOT NULL,                               -- 'Admin', 'Advisor', 'Office', 'Student'
    `faculty` VARCHAR(255) NULL,                               -- Faculty (for Students and Advisors)
    `branch` VARCHAR(255) NULL,                                -- Program/Branch of study
    `deptName` VARCHAR(255) NULL,                              -- Department name (for Office staff)
    `phone` VARCHAR(255) NULL,                                 -- Contact phone number
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. Table: GraduationRequests
-- Holds the status, review steps, and document paths for graduation.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `GraduationRequests` (
    `id` CHAR(36) PRIMARY KEY,                                 -- UUID v4
    `studentId` VARCHAR(255) NOT NULL,                         -- References Users(id)
    `academicYear` VARCHAR(255) NOT NULL,                      -- e.g. "2569" (Buddhist Era)
    `semester` VARCHAR(255) NOT NULL,                          -- "1" or "2"
    `status` VARCHAR(50) DEFAULT 'Pending',                    -- 'Pending', 'In Progress', 'Completed', 'Rejected'
    
    -- Sequelize maps JSON datatype to TEXT in SQLite / JSON in MySQL
    `steps` TEXT DEFAULT '{"advisor":{"status":"waiting","comment":"","updatedAt":null},"language_center":{"status":"waiting","comment":"","updatedAt":null},"registration":{"status":"waiting","comment":"","updatedAt":null},"activity_center":{"status":"waiting","comment":"","updatedAt":null}}',
    `documents` TEXT DEFAULT '[]',                             -- List of files uploaded by the student
    
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`studentId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------------------
-- 3. Table: Notifications
-- Notifications sent to users when a request status changes.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Notifications` (
    `id` CHAR(36) PRIMARY KEY,                                 -- UUID v4
    `userId` VARCHAR(255) NOT NULL,                            -- References Users(id)
    `message` TEXT NOT NULL,                                   -- Thai notification text
    `type` VARCHAR(255) DEFAULT 'GENERAL',                     -- 'GENERAL', 'REJECTED', 'COMPLETED', etc.
    `isRead` TINYINT(1) DEFAULT 0,                             -- Boolean: 0 = false, 1 = true
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- --------------------------------------------------------------------
-- 4. Table: AuditLogs
-- History log tracking action updates (security & tracking).
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `AuditLogs` (
    `id` CHAR(36) PRIMARY KEY,                                 -- UUID v4
    `userId` VARCHAR(255) NOT NULL,                            -- Who performed the action (User ID)
    `action` VARCHAR(255) NOT NULL,                            -- Action name (e.g. "UPDATE_STEP_STATUS")
    `requestId` VARCHAR(255) NULL,                             -- References GraduationRequests(id)
    `details` TEXT NULL,                                       -- Extra information
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- Indexes for performance optimization
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS `idx_users_role` ON `Users` (`role`);
CREATE INDEX IF NOT EXISTS `idx_requests_student` ON `GraduationRequests` (`studentId`);
CREATE INDEX IF NOT EXISTS `idx_notifications_user` ON `Notifications` (`userId`);

-- --------------------------------------------------------------------
-- 5. Seed Data (Initial/Default accounts)
-- Passwords are encrypted using the application's PBKDF2 hash scheme:
--   - Admin password: admin1234
--   - Office password: office1234
-- --------------------------------------------------------------------

-- Seed System Admin
INSERT INTO `Users` (`id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`)
VALUES (
    'admin', 
    'System Admin', 
    'admin@sskru.ac.th', 
    '10000.cc6d83fb2ce3469df5d5c0774205566cf2c2a0d0d8291a136bf069792036735a28ad026a798a728bfa17cb756a1b2d04a6018376510d297d0221379bd4ef5824', -- PBKDF2 hash of "admin1234"
    'Admin', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
) ON CONFLICT(`id`) DO NOTHING;

-- Seed Office Staff Departments
INSERT INTO `Users` (`id`, `name`, `email`, `password`, `role`, `deptName`, `createdAt`, `updatedAt`)
VALUES 
(
    'office_ฝ่ายทะเบียน', 
    'เจ้าหน้าที่ ฝ่ายทะเบียน', 
    'office_ฝ่ายทะเบียน@sskru.ac.th', 
    '10000.cc6d83fb2ce3469df5d5c0774205566cf2c2a0d0d8291a136bf069792036735a28ad026a798a728bfa17cb756a1b2d04a6018376510d297d0221379bd4ef5824', -- PBKDF2 hash of "office1234"
    'Office', 
    'ฝ่ายทะเบียน', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),
(
    'office_ฝ่ายวิทยบริการและเทคโนโลยี', 
    'เจ้าหน้าที่ ฝ่ายวิทยบริการและเทคโนโลยี', 
    'office_ฝ่ายวิทยบริการและเทคโนโลยี@sskru.ac.th', 
    '10000.cc6d83fb2ce3469df5d5c0774205566cf2c2a0d0d8291a136bf069792036735a28ad026a798a728bfa17cb756a1b2d04a6018376510d297d0221379bd4ef5824',
    'Office', 
    'ฝ่ายวิทยบริการและเทคโนโลยี', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),
(
    'office_ฝ่ายศูนย์ภาษา', 
    'เจ้าหน้าที่ ฝ่ายศูนย์ภาษา', 
    'office_ฝ่ายศูนย์ภาษา@sskru.ac.th', 
    '10000.cc6d83fb2ce3469df5d5c0774205566cf2c2a0d0d8291a136bf069792036735a28ad026a798a728bfa17cb756a1b2d04a6018376510d297d0221379bd4ef5824',
    'Office', 
    'ฝ่ายศูนย์ภาษา', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
),
(
    'office_ฝ่ายกิจกรรม', 
    'เจ้าหน้าที่ ฝ่ายกิจกรรม', 
    'office_ฝ่ายกิจกรรม@sskru.ac.th', 
    '10000.cc6d83fb2ce3469df5d5c0774205566cf2c2a0d0d8291a136bf069792036735a28ad026a798a728bfa17cb756a1b2d04a6018376510d297d0221379bd4ef5824',
    'Office', 
    'ฝ่ายกิจกรรม', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
) ON CONFLICT(`id`) DO NOTHING;
