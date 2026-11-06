#!/bin/sh
set -eu
if [ "$(id -u)" = "0" ]; then
  chown app:app /data
  exec setpriv --reuid=app --regid=app --init-groups -- "$@"
fi
exec "$@"
