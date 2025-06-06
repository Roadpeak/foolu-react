-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: foolu
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `campaign_id` int NOT NULL AUTO_INCREMENT,
  `creator_user_id` bigint NOT NULL,
  `video_id` int NOT NULL,
  `status` enum('draft','pending_payment','active','paused','completed','rejected') NOT NULL DEFAULT 'draft',
  `total_budget` decimal(12,4) NOT NULL,
  `spent_budget` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `cost_per_view` decimal(8,4) NOT NULL,
  `viewer_payout_per_view` decimal(8,4) NOT NULL,
  `target_views` int DEFAULT NULL,
  `achieved_views` int NOT NULL DEFAULT '0',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`campaign_id`),
  KEY `video_id` (`video_id`),
  KEY `idx_campaign_status` (`status`),
  KEY `idx_campaign_creator` (`creator_user_id`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`creator_user_id`) REFERENCES `foolu_users` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `campaigns_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creator_payments`
--

DROP TABLE IF EXISTS `creator_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creator_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `creator_user_id` bigint NOT NULL,
  `amount` decimal(12,4) NOT NULL,
  `payment_gateway` enum('stripe','paypal','manual') NOT NULL,
  `gateway_transaction_id` varchar(255) NOT NULL,
  `status` enum('pending','succeeded','failed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `gateway_transaction_id` (`gateway_transaction_id`),
  KEY `creator_user_id` (`creator_user_id`),
  KEY `idx_creator_payment_status` (`status`),
  CONSTRAINT `creator_payments_ibfk_1` FOREIGN KEY (`creator_user_id`) REFERENCES `foolu_users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `foolu_users`
--

DROP TABLE IF EXISTS `foolu_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foolu_users` (
  `userId` bigint NOT NULL AUTO_INCREMENT,
  `foolu_name` varchar(45) DEFAULT NULL,
  `foolu_username` varchar(45) NOT NULL,
  `foolu_email` varchar(45) NOT NULL,
  `foolu_pass` varchar(250) NOT NULL,
  `foolu_role` enum('creator','viewer') NOT NULL,
  `balance` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `creator_promo_balance` decimal(12,4) NOT NULL DEFAULT '0.0000',
  `profile_picture_url` varchar(512) DEFAULT NULL,
  `channel_link` varchar(512) DEFAULT NULL,
  `views_goal` int DEFAULT NULL,
  `subscribers_goal` int DEFAULT NULL,
  `withdrawal_threshold` decimal(10,4) NOT NULL DEFAULT '5.0000',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `idfoolu_users_UNIQUE` (`userId`),
  KEY `idx_user_role` (`foolu_role`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `video_id` int NOT NULL AUTO_INCREMENT,
  `creator_user_id` bigint NOT NULL,
  `youtube_video_id` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `duration_seconds` int DEFAULT NULL,
  `is_eligible_for_promotion` tinyint(1) NOT NULL DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`video_id`),
  UNIQUE KEY `youtube_video_id` (`youtube_video_id`),
  KEY `creator_user_id` (`creator_user_id`),
  CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`creator_user_id`) REFERENCES `foolu_users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `watch_history`
--

DROP TABLE IF EXISTS `watch_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `watch_history` (
  `history_id` bigint NOT NULL AUTO_INCREMENT,
  `viewer_user_id` bigint NOT NULL,
  `video_id` int NOT NULL,
  `campaign_id` int DEFAULT NULL,
  `watched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `watch_duration_seconds` int NOT NULL DEFAULT '0',
  `is_complete` tinyint(1) NOT NULL DEFAULT '0',
  `earned_amount` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `is_credited_to_balance` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`history_id`),
  KEY `video_id` (`video_id`),
  KEY `idx_watch_viewer_video` (`viewer_user_id`,`video_id`),
  KEY `idx_watch_campaign` (`campaign_id`),
  CONSTRAINT `watch_history_ibfk_1` FOREIGN KEY (`viewer_user_id`) REFERENCES `foolu_users` (`userId`) ON DELETE CASCADE,
  CONSTRAINT `watch_history_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`video_id`) ON DELETE CASCADE,
  CONSTRAINT `watch_history_ibfk_3` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`campaign_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `withdrawals`
--

DROP TABLE IF EXISTS `withdrawals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawals` (
  `withdrawal_id` int NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `amount` decimal(12,4) NOT NULL,
  `method` enum('mpesa','bank','paypal') NOT NULL,
  `status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `account_details` text NOT NULL,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`withdrawal_id`),
  KEY `idx_withdrawal_status` (`status`),
  KEY `idx_withdrawal_user` (`user_id`),
  CONSTRAINT `withdrawals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `foolu_users` (`userId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-08 13:13:57
