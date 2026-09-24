#!/usr/bin/env bash
# Render build script. Runs from djangobackend/ on every deploy.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# The free plan has no shell access, so create the superuser here from the
# DJANGO_SUPERUSER_* env vars. It already exists on every deploy after the first.
if [[ -n "$DJANGO_SUPERUSER_EMAIL" ]]; then
    python manage.py createsuperuser --no-input \
        || echo "Superuser not created (it probably already exists)."
fi
