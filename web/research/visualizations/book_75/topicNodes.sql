select allTopics.name, allTopics.id , count(l.tct_id) ocount

FROM  
(
SELECT name, id  FROM 

(SELECT DISTINCTROW t.display_name_do_not_use name, t.tct_id id FROM topics t
      INNER JOIN occurrences o  ON t.tct_id  = o.topic_id
      INNER JOIN locations l  ON o.location_id = l.tct_id
            INNER JOIN epubs e ON e.tct_id = l.epub_id
            WHERE e.tct_id = 75) t1
UNION 
SELECT DISTINCTROW t.display_name_do_not_use name, t.tct_id id FROM topics t
     INNER JOIN relations r  ON r.role_from_topic_id  = t.tct_id
     WHERE r.relation_type_id = 4 
     AND r.role_to_topic_id IN 
         (SELECT t.tct_id tid FROM topics t
            INNER JOIN occurrences o  ON t.tct_id  = o.topic_id
            INNER JOIN locations l  ON o.location_id = l.tct_id
            INNER JOIN epubs e ON e.tct_id = l.epub_id
                WHERE e.tct_id = 75)  ) allTopics

LEFT  JOIN occurrences o2  ON o2.topic_id =  allTopics.id  
LEFT  JOIN (select * from locations WHERE locations.epub_id = 75 ) l  ON o2.location_id = l.tct_id


     
GROUP BY allTopics.name ORDER BY ocount ASC
