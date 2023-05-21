#!/bin/bash

# Start the first process
npm --prefix ./authentication-service start &

# Start the second process
npm --prefix ./documents-service start &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?