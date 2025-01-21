set -o errexit

pip install -r requirements.txt

cd backend

python manage.py runserver

