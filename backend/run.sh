#!/bin/bash

# Start both services
node ./authentication-service/src/index.js &
AUTHENTICATION_PID=$!

node ./documents-service/src/index.js &
DOCUMENTS_PID=$!

_term() {
  echo "Caught termination signal!"
  kill -TERM "$AUTHENTICATION_PID" "$DOCUMENTS_PID" 2>/dev/null
}

trap _term SIGTERM SIGINT

# Wait until any of the processes exits
while kill -0 "$AUTHENTICATION_PID" 2>/dev/null && kill -0 "$DOCUMENTS_PID" 2>/dev/null; do
  sleep 1
done

# Find out the status of the process that exited first
if kill -0 "$AUTHENTICATION_PID" 2>/dev/null; then
  wait "$DOCUMENTS_PID"
else
  wait "$AUTHENTICATION_PID"
fi
EXIT_CODE=$?

# Stop the other one, so the container exits (and can be restarted) as a whole
kill -TERM "$AUTHENTICATION_PID" "$DOCUMENTS_PID" 2>/dev/null
wait

exit $EXIT_CODE
