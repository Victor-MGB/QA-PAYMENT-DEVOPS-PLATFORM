#!/bin/bash
CRON_JOB="*/2 * * * * /bin/bash /home/ubuntu/qa-devops-platform/watchdog/monitor.sh >> /var/log/qa-watchdog.log 2>&1"
(crontab -l 2>/dev/null | grep -v "monitor.sh"; echo "$CRON_JOB") | crontab -
echo "Cron job installed:"
crontab -l
