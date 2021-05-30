create database weather_detail;
CREATE TABLE `weather_detail`.`users` ( `id` INT NOT NULL AUTO_INCREMENT , `username` VARCHAR(50) NOT NULL , `email` VARCHAR(50) NOT NULL , `password` VARCHAR(50) NOT NULL , PRIMARY KEY (`id`));
CREATE TABLE `weather_detail`.`weather_data` ( `city` VARCHAR(50) NOT NULL , `temperature` VARCHAR(50) NOT NULL , `description` VARCHAR(50) NOT NULL , `min_temperature` VARCHAR(50) NOT NULL , `max_temperature` VARCHAR(50) NOT NULL , `wind` VARCHAR(50) NOT NULL , `rain` VARCHAR(50) NOT NULL , `cloud_percent` VARCHAR(50) NOT NULL , `user_email` VARCHAR(50) NOT NULL );