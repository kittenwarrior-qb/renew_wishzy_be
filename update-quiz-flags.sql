-- Update lectures to set requiresQuiz = true if they have associated quizzes
UPDATE lectures 
SET requires_quiz = true 
WHERE id IN (
  SELECT DISTINCT entity_id 
  FROM quizzes 
  WHERE entity_id IS NOT NULL
);

-- Update lectures to set requiresQuiz = false if they have no associated quizzes  
UPDATE lectures 
SET requires_quiz = false 
WHERE id NOT IN (
  SELECT DISTINCT entity_id 
  FROM quizzes 
  WHERE entity_id IS NOT NULL
);

-- Verify the results
SELECT 
  l.id, 
  l.name, 
  l.requires_quiz, 
  COUNT(q.id) as quiz_count
FROM lectures l
LEFT JOIN quizzes q ON l.id = q.entity_id
WHERE l.requires_quiz = true
GROUP BY l.id, l.name, l.requires_quiz
ORDER BY l.name;