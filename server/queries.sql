-- name: get_speakers
SELECT *
FROM speaker


-- name: insert_meeting
INSERT INTO meeting (name, code, speaker_duration, auto_proceed, state) 
VALUES :$meeting

-- name: get_meeting_by_id
SELECT *
FROM meeting
WHERE id = :id
LIMIT 1

-- name: get_meeting_by_code
SELECT *
FROM meeting
WHERE code = :code
LIMIT 1