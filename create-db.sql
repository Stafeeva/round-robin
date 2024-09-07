CREATE TABLE IF NOT EXISTS `speaker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(45) NOT NULL,
  `last_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE);

CREATE TABLE IF NOT EXISTS `meeting` (
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

CREATE TABLE IF NOT EXISTS `meeting_speaker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meeting_id` INT NOT NULL,
  `speaker_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_meeting_id_speaker_id` (`meeting_id`,`speaker_id`),
  INDEX `meeting_id_idx` (`meeting_id` ASC) VISIBLE,
  INDEX `speaker_id_idx` (`speaker_id` ASC) VISIBLE,
  CONSTRAINT `meeting_id_meeting_speaker`
    FOREIGN KEY (`meeting_id`)
    REFERENCES .`meeting` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `speaker_id_meeting_speaker`
    FOREIGN KEY (`speaker_id`)
    REFERENCES .`speaker` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS `note` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meeting_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `speaker_id` INT NOT NULL,
  `text` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `meeting_id_idx` (`meeting_id` ASC) VISIBLE,
  INDEX `speaker_id_idx` (`speaker_id` ASC) VISIBLE,
  CONSTRAINT `meeting_id_note`
    FOREIGN KEY (`meeting_id`)
    REFERENCES .`meeting` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `speaker_id_note`
    FOREIGN KEY (`speaker_id`)
    REFERENCES .`speaker` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS `action` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `meeting_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `created_by` INT NOT NULL,
  `owner_id` INT NOT NULL,
  `text` TEXT NOT NULL,
  `completed` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `meeting_id_idx` (`meeting_id` ASC) VISIBLE,
  INDEX `created_by_idx` (`created_by` ASC) VISIBLE,
  INDEX `owner_id_idx` (`owner_id` ASC) VISIBLE,
  CONSTRAINT `meeting_id_action`
    FOREIGN KEY (`meeting_id`)
    REFERENCES .`meeting` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `created_by_action`
    FOREIGN KEY (`created_by`)
    REFERENCES .`speaker` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `owner_id_action`
    FOREIGN KEY (`owner_id`)
    REFERENCES .`speaker` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);

INSERT INTO speaker (username, password, first_name, last_name)
VALUES 
('dylan', '$2b$05$z1BOiTUtTOwDvKbmqEetXOzKY1532x0mHiWZ4RkasCdOgj904r3vG',  'Dylan', 'King'), 
('bob', '$2b$05$z1BOiTUtTOwDvKbmqEetXOzKY1532x0mHiWZ4RkasCdOgj904r3vG',    'Bob', 'Marley'), 
('maggie', '$2b$05$z1BOiTUtTOwDvKbmqEetXOzKY1532x0mHiWZ4RkasCdOgj904r3vG', 'Maggie', 'May'), 
('janis', '$2b$05$z1BOiTUtTOwDvKbmqEetXOzKY1532x0mHiWZ4RkasCdOgj904r3vG',  'Janis', 'Joplin');

INSERT INTO meeting (name, code, speaker_duration, auto_proceed, state, speaker_queue)
VALUES 
('Apollo standup', 'abc-123-xyz', 30, 0, 'NotStarted', '[]');

INSERT INTO meeting_speaker (meeting_id, speaker_id)
VALUES 
(1, 1), 
(1, 2), 
(1, 3), 
(1, 4);

