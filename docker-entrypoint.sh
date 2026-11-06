#!/bin/sh
set -eu
if [ "$(id -u)" = "0" ]; then
  # Existing volumes were created by the root image. SQLite needs the
  # directory and the database file writable by the app user.
  chown -R app:app /data
  exec setpriv --reuid=app --regid=app --init-groups -- "$@"
fi
exec "$@"
