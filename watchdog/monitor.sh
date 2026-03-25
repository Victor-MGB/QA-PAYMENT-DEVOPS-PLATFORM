#!/bin/bash

LOG_FILE="/var/log/qa-watchdog.log"
CONTAINER_NAME="qa-platform"
HEALTH_URL="http://localhost:3000/health"
ECR_URI="${ECR_URI:-your-ecr-uri-here}"
MAX_RESTARTS=3
RESTART_COUNT=0

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

check_container() {
  docker ps --filter "name=$CONTAINER_NAME" --filter "status=running" | grep -q $CONTAINER_NAME
}

check_health() {
  curl -sf $HEALTH_URL > /dev/null 2>&1
}

restart_container() {
  log "ALERT: Container $CONTAINER_NAME is down. Attempting restart..."

  docker stop $CONTAINER_NAME 2>/dev/null
  docker rm $CONTAINER_NAME 2>/dev/null

  docker run -d \
    --name $CONTAINER_NAME \
    --restart always \
    -p 3000:3000 \
    $ECR_URI:latest

  sleep 5

  if check_health; then
    log "SUCCESS: Container restarted and healthy."
    RESTART_COUNT=0
  else
    log "ERROR: Container restarted but health check failed."
    RESTART_COUNT=$((RESTART_COUNT + 1))
  fi
}

pull_latest() {
  log "INFO: Pulling latest image from ECR..."
  aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin $ECR_URI 2>/dev/null
  docker pull $ECR_URI:latest
}

log "INFO: Watchdog check started."

if ! check_container; then
  log "WARNING: Container not running."
  restart_container
elif ! check_health; then
  log "WARNING: Container running but health check failed."
  restart_container
else
  log "OK: Container is running and healthy."
fi

if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
  log "CRITICAL: Container failed to restart $MAX_RESTARTS times. Manual intervention required."
fi

log "INFO: Watchdog check complete."
