-- name: list_meetings
SELECT *
FROM meeting

-- name: list_meetings_by_speaker_id
SELECT m.*
FROM meeting m, meeting_speaker ms
WHERE m.id = ms.meeting_id
AND ms.speaker_id = :speaker_id

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

-- name: get_meeting_speakers
SELECT s.*
FROM speaker s, meeting m, meeting_speaker ms
WHERE m.code = :code 
AND m.id = ms.meeting_id
AND s.id = ms.speaker_id

-- name: add_speaker_to_meeting
INSERT INTO meeting_speaker (meeting_id, speaker_id)
VALUES (:meeting_id, :speaker_id)

-- name: create_note
INSERT INTO note (meeting_id, speaker_id, text)
VALUES (:meeting_id, :speaker_id, :text)

-- name: get_note
SELECT *
FROM note
WHERE id = :id

-- name: get_notes
SELECT *
FROM note
WHERE meeting_id = :meeting_id
ORDER BY created_at DESC

-- name: create_action
INSERT INTO action (meeting_id, created_by, owner_id, text)
VALUES (:meeting_id, :created_by, :owner_id, :text)

-- name: get_action
SELECT *
FROM action
WHERE id = :id


-- name: get_actions
SELECT *
FROM action
WHERE meeting_id = :meeting_id
ORDER BY created_at DESC