from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGO_URI: str
    DB_NAME: str
    JWT_SECRET: str
    GEMINI_API_KEY: str  # 1. Naya Addition: Gemini key ko validate karne ke liye line jodi

    # .env file ko auto-load aur read karne ke liye config
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Global configuration object instance
settings = Settings()