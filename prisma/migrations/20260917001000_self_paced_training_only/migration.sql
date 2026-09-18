-- Make training delivery strictly self-paced going forward.
UPDATE "TrainingCourse"
SET "format" = 'ONLINE_SELF_PACED'
WHERE "format" <> 'ONLINE_SELF_PACED';
