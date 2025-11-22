-- =============================================
-- E-Shop Database Setup Script
-- =============================================
-- This script creates the complete database schema for the E-Shop application
-- including all tables, relationships, and constraints.

-- Create and use the database
CREATE DATABASE IF NOT EXISTS eshop;
USE eshop;

-- =============================================
-- Core Tables
-- =============================================

-- Admin table
CREATE TABLE `admin` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `special_word` varchar(50) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Customer table
CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================
-- Product Related Tables
-- =============================================

-- Product table
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(100) DEFAULT NULL,
  `product_type` varchar(50) DEFAULT NULL,
  `product_price` decimal(10,2) DEFAULT NULL,
  `product_ranking` int DEFAULT NULL,
  `product_image` varchar(255) DEFAULT NULL,
  `product_image_blob` longblob,
  `image_mime_type` varchar(50) DEFAULT 'image/jpeg',
  `product_discription` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Product images table
CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_data` longblob NOT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(50) DEFAULT 'image/jpeg',
  `file_size` int DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_primary` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`image_id`),
  KEY `idx_product_images_product_id` (`product_id`),
  KEY `idx_product_images_primary` (`product_id`,`is_primary`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Product sizes table
CREATE TABLE `product_sizes` (
  `size_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size` varchar(10) NOT NULL,
  PRIMARY KEY (`size_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_sizes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inventory table
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `stock_quantity` int DEFAULT NULL,
  PRIMARY KEY (`inventory_id`),
  KEY `inventory_ibfk_1` (`product_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================
-- Order Related Tables
-- =============================================

-- Discount table
CREATE TABLE `discount` (
  `discount_id` int NOT NULL AUTO_INCREMENT,
  `discount_code` varchar(50) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `max_uses` int DEFAULT NULL,
  PRIMARY KEY (`discount_id`),
  UNIQUE KEY `discount_code` (`discount_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Order table
CREATE TABLE `order` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `order_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `discount_id` int DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `discount_code` varchar(50) DEFAULT NULL,
  `final_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `customer_id` (`customer_id`),
  KEY `order_ibfk_2` (`discount_id`),
  CONSTRAINT `order_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  CONSTRAINT `order_ibfk_2` FOREIGN KEY (`discount_id`) REFERENCES `discount` (`discount_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Order items table
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `product_price` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `product_size` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Payment table
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `payment_amount` decimal(10,2) DEFAULT NULL,
  `cardNumber` varchar(20) NOT NULL,
  `expDate` varchar(7) NOT NULL,
  `cvv` varchar(4) NOT NULL,
  `cardHolder` varchar(100) NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Bill table
CREATE TABLE `bill` (
  `bill_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `bill_date` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`bill_id`),
  KEY `order_id` (`order_id`),
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `bill_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`),
  CONSTRAINT `bill_ibfk_2` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`payment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Shipping table
CREATE TABLE `shipping` (
  `shipping_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `shipping_address` varchar(255) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `shipping_date` datetime DEFAULT NULL,
  `tracking_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`shipping_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================
-- Chat/Messaging Related Tables
-- =============================================

-- Chat sessions table
CREATE TABLE `chat_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `session_type` enum('customer','admin') DEFAULT 'customer',
  `first_message_at` timestamp NULL DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `total_messages` int DEFAULT '0',
  `total_user_messages` int DEFAULT '0',
  `total_bot_messages` int DEFAULT '0',
  `average_response_time_ms` float DEFAULT NULL,
  `session_duration_seconds` int DEFAULT NULL,
  `primary_intent` varchar(100) DEFAULT NULL,
  `customer_satisfaction` enum('positive','neutral','negative') DEFAULT NULL,
  `resolution_status` enum('resolved','unresolved','escalated') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_session_type` (`session_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_primary_intent` (`primary_intent`),
  CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Chat conversations table
CREATE TABLE `chat_conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `sender` enum('user','bot','admin','admin_bot') NOT NULL,
  `message` text NOT NULL,
  `intent` varchar(100) DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `current_page` varchar(255) DEFAULT NULL,
  `user_agent` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `response_time_ms` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_intent` (`intent`),
  KEY `idx_sender` (`sender`),
  KEY `idx_session_created` (`session_id`,`created_at`),
  KEY `idx_user_date` (`user_email`,`created_at`),
  KEY `idx_intent_date` (`intent`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Chat analytics table
CREATE TABLE `chat_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_recorded` date NOT NULL,
  `hour_recorded` tinyint DEFAULT NULL,
  `total_sessions` int DEFAULT '0',
  `total_messages` int DEFAULT '0',
  `unique_users` int DEFAULT '0',
  `average_session_duration` float DEFAULT NULL,
  `average_response_time` float DEFAULT NULL,
  `most_common_intent` varchar(100) DEFAULT NULL,
  `resolved_sessions` int DEFAULT '0',
  `escalated_sessions` int DEFAULT '0',
  `customer_satisfaction_score` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_date_hour` (`date_recorded`,`hour_recorded`),
  KEY `idx_date` (`date_recorded`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Chat common queries table
CREATE TABLE `chat_common_queries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `query_text` text NOT NULL,
  `normalized_query` text NOT NULL,
  `frequency_count` int DEFAULT '1',
  `intent` varchar(100) DEFAULT NULL,
  `average_confidence` float DEFAULT NULL,
  `suggested_response` text,
  `last_asked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_intent` (`intent`),
  KEY `idx_frequency` (`frequency_count` DESC),
  KEY `idx_last_asked` (`last_asked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Messages table (contact form)
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================
-- Other Tables
-- =============================================

-- Newsletter subscribers table
CREATE TABLE `news_subscribers` (
  `subscriber_id` int NOT NULL AUTO_INCREMENT,
  `subscriber_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`subscriber_id`),
  UNIQUE KEY `unique_email` (`subscriber_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Wishlist table
CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `product_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_product_unique` (`customer_id`,`product_id`),
  KEY `customer_id` (`customer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================
-- End of Database Setup Script
-- =============================================
