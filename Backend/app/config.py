from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Mapping exact variables from our Backend/.env file
    MONGODB_URL: str
    DATABASE_NAME: str
    PARSER_API_KEY: str
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore" # Prevents crash if extra variables are present in env

settings = Settings()