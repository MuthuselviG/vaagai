# Manual Triggers

## Current Affairs Cron

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://mcqpalagu.in/api/cron/current-affairs
```

**Verify inserted:**
```sql
SELECT count(*) FROM questions
WHERE source_type = 'current_affairs'
AND published_date = 'YYYY-MM-DD';
-- Should return 40
```

**Delete a bad run:**
```sql
DELETE FROM questions
WHERE source_type = 'current_affairs'
AND published_date = 'YYYY-MM-DD';
```
