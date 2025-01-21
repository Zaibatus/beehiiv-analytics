INSTALLED_APPS = [
    # ... existing apps ...
    'corsheaders',
]

MIDDLEWARE = [
    # Add this at the beginning of the middleware list
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... rest of your middleware ...
]

# During development, allow all origins
CORS_ALLOW_ALL_ORIGINS = True  # Only for development!

# For production, specify allowed origins:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite's default port
    "http://127.0.0.1:5173",
] 