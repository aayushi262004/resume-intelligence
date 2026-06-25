from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
     print("Password:", repr(payload.password))
    print("Length:", len(payload.password))
    print("Bytes:", len(payload.password.encode("utf-8")))
    try:
        existing = db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            email=payload.email,
            hashed_password=hash_password(payload.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    except Exception as e:
        print("REGISTER ERROR:", e)
        raise

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)