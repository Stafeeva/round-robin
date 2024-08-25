CREATE TABLE IF NOT EXISTS `roundrobin`.`speaker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE);

CREATE TABLE IF NOT EXISTS `roundrobin`.`meeting` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `code` VARCHAR(12) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `speaker_duration` INT NOT NULL,
  `auto_proceed` TINYINT NOT NULL,
  `state` VARCHAR(45) NOT NULL,
  `speaker_queue` JSON NOT NULL DEFAULT '[]',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `code_UNIQUE` (`code` ASC) VISIBLE);

CREATE TABLE IF NOT EXISTS `roundrobin`.`meeting_speaker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meeting_id` INT NULL,
  `speaker_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_meeting_id_speaker_id` (`meeting_id`,`speaker_id`),
  INDEX `meeting_id_idx` (`meeting_id` ASC) VISIBLE,
  INDEX `speaker_id_idx` (`speaker_id` ASC) VISIBLE,
  CONSTRAINT `meeting_id`
    FOREIGN KEY (`meeting_id`)
    REFERENCES `roundrobin`.`meeting` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `speaker_id`
    FOREIGN KEY (`speaker_id`)
    REFERENCES `roundrobin`.`speaker` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

