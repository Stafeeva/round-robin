-- name: list_meetings
SELECT *
FROM meeting

-- name: get_meeting
SELECT *
FROM meeting
WHERE code = :code
LIMIT 1

-- name: create_meeting
INSERT INTO meeting (name, code, speaker_duration, auto_proceed, state)
VALUES (:name, :code, :speaker_duration, :auto_proceed, :state)

-- name: delete_meeting
DELETE FROM meeting
WHERE code = :code
LIMIT 1

-- name: update_meeting_state
UPDATE meeting
SET state = :state, speaker_queue = :speaker_queue
WHERE code = :code

-- name: get_speaker
SELECT *
FROM speaker
WHERE username = :username
LIMIT 1

-- name: create_speaker
INSERT INTO speaker (username, password, first_name, last_name)
VALUES (:username, :password, :first_name, :last_name)