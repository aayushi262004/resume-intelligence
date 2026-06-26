from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Resume Intelligence API"
    debug: bool = False

    database_url: str
    groq_api_key: str

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # Add this
    google_client_id: str

    class Config:
        env_file = ".env"

settings = Settings()