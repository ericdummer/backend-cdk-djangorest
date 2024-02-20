#!/bin/bash

# Directory to check
DIRECTORY="/path/to/directory"

# Maximum allowed size (in MB)
MAX_SIZE=512

# Calculate the size of the directory (in MB)
FOLDER_SIZE=$(du -sm "$DIRECTORY" | cut -f1)

# Compare folder size with the maximum allowed size
if [ "$FOLDER_SIZE" -gt "$MAX_SIZE" ]; then
   echo "Alert: The size of $DIRECTORY is greater than ${MAX_SIZE}MB."
   # You can add additional commands here to handle the alert, like sending an email or notification.
fi