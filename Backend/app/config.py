from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 1. Variables ko define kar rahe hain aur unka data type bata rahe hain
    MONGO_URI: str
    DB_NAME: str
    JWT_SECRET: str
    GEMINI_API_KEY: str

    # 2. Pydantic ko bata rahe hain ki data .env file se uthana hai
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Settings ka ek single object (instance) bana rahe hain taaki poori app me use ho sake
settings = Settings()