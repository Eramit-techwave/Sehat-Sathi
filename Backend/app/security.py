from passlib.context import CryptContext

# 1. Passlib ko bata rahe hain ki hum password hashing ke liye 'bcrypt' use karenge
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Function: Plain password lekar usko secure hash me convert karne ke liye
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# 3. Function: Login ke time check karne ke liye ki kya user ka dala password sahi hai ya nahi
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)