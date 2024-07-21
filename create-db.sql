CREATE TABLE `roundrobin`.`speaker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE);


CREATE TABLE `roundrobin`.`meeting` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `code` VARCHAR(12) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `speaker_duration` INT NOT NULL,
  `auto_proceed` TINYINT NOT NULL,
  `state` VARCHAR(45) NOT NULL,
  `current_speaker` INT NULL,
  `speaker_queue` JSON NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `code_UNIQUE` (`code` ASC) VISIBLE);

CREATE TABLE `roundrobin`.`meeting_speaker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meeting_id` INT NULL,
  `speaker_id` INT NULL,
  PRIMARY KEY (`id`),
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

