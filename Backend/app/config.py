from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Mapping exact variables from our Backend/.env file
    MONGODB_URL: str
    DATABASE_NAME: str
    PARSER_API_KEY: str
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Razorpay Payment Gateway Configuration
    RAZORPAY_KEY_ID: str = "rzp_test_TLFligzH93mFjS"
    RAZORPAY_KEY_SECRET: str = "jkjxmPmmCKHS3FLpDhqWXPhk"
    RAZORPAY_WEBHOOK_SECRET: str = "sehat_sathi_wh_sec_2026_x9"

    # GEMINI_API_KEY is an alias for PARSER_API_KEY for backward compatibility
    @property
    def GEMINI_API_KEY(self) -> str:
        return self.PARSER_API_KEY

    class Config:
        env_file = ".env"
        extra = "ignore"  # Prevents crash if extra variables are present in env

settings = Settings()