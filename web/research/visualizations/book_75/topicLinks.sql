Select  role_from_topic_id source , role_to_topic_id target  FROM relations r 

WHERE  role_from_topic_id IN 

(Select DISTINCTROW id FROM 

    (SELECT  t.tct_id id FROM topics t
     INNER JOIN occurrences o  ON t.tct_id  = o.topic_id
     INNER JOIN locations l  ON o.location_id = l.tct_id
            INNER JOIN epubs e ON e.tct_id = l.epub_id
            WHERE e.tct_id = 75) t1
    UNION 
    SELECT  t.tct_id id FROM topics t
     INNER JOIN relations r  ON r.role_from_topic_id  = t.tct_id
     WHERE r.relation_type_id = 4 
     AND r.role_to_topic_id IN 
         (SELECT t.tct_id tid FROM topics t
             INNER JOIN occurrences o  ON t.tct_id  = o.topic_id
             INNER JOIN locations l  ON o.location_id = l.tct_id
             INNER JOIN epubs e ON e.tct_id = l.epub_id
             WHERE e.tct_id = 75) 
) 
             
AND  r.role_to_topic_id IN  

    (Select DISTINCTROW id FROM 

    (SELECT  t.tct_id id FROM topics t
     INNER JOIN occurrences o  ON t.tct_id  = o.topic_id
     INNER JOIN locations l  ON o.location_id = l.tct_id
            INNER JOIN epubs e ON e.tct_id = l.epub_id
            WHERE e.tct_id = 75) t2
    UNION 
    SELECT  t.tct_id id FROM topics t
     INNER JOIN relations r  ON r.role_from_topic_id  = t.tct_id
     WHERE r.relation_type_id = 4 
     AND r.role_to_topic_id IN 
         (SELECT t.tct_id tid FROM topics t
             INNER JOIN occurrences o  ON t.tct_id  = o.topic_id
             INNER JOIN locations l  ON o.location_id = l.tct_id
             INNER JOIN epubs e ON e.tct_id = l.epub_id
             WHERE e.tct_id = 75) 
) 

    