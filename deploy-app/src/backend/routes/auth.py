import base64
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from backend.constants import ADMIN_ROLE, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from backend.models import TokenData, User, Token
from backend.storage_engines import StorageProxy, CsvStorage

from backend.utils import log_with_color


# Initialize OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Router for auth related endpoints
router = APIRouter()

# Storage proxy initialization
storage_proxy = StorageProxy(CsvStorage(users_file='users.csv'))
log_with_color("Storage proxy initialized", "green")


# Function to create access token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.utcnow() + expires_delta
  else:
    expire = datetime.utcnow() + timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt


# Dependency for getting the current user
async def get_current_user(token: str = Depends(oauth2_scheme)):
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get("sub")
    if username is None:
      raise credentials_exception
    token_data = TokenData(username=username)
  except JWTError:
    raise credentials_exception
  user = storage_proxy.read_user(username=token_data.username)
  if user is None:
    raise credentials_exception
  return user


async def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
  if current_user['role'] != ADMIN_ROLE:
    raise HTTPException(status_code=403, detail="Insufficient permissions")
  return current_user

@router.post("/token/validate")
async def validate_token(token: dict = Body(..., media_type="application/json")):
  try:
    payload = jwt.decode(token['token'], SECRET_KEY, algorithms=[ALGORITHM])
    username: str = payload.get("sub")
    if username is None:
      raise HTTPException(
        status_code=401,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"}
      )
    token_data = TokenData(username=username)
    current_user = storage_proxy.read_user(username=token_data.username)
    current_user['username'] = base64.b64decode(current_user['username']).decode('utf-8')
    print(f"Current user: {current_user}")
    if current_user is None:
      raise HTTPException(
        status_code=401,
        detail="Invalid token",
        headers={"WWW-Authenticate": "Bearer"}
      )
    return {"success": True, "profile": current_user}

  except jwt.ExpiredSignatureError:
    raise HTTPException(
      status_code=401,
      detail="Token has expired",
      headers={"WWW-Authenticate": "Bearer"}
    )
  except jwt.InvalidTokenError:
    raise HTTPException(
      status_code=401,
      detail="Invalid token",
      headers={"WWW-Authenticate": "Bearer"}
    )
  return {"success": True}


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
  user = None
  try:
    user = storage_proxy.authenticate_user(form_data.username, form_data.password)
  except Exception as e:
    raise HTTPException(status_code=403, detail=str(e))
  
  if not user:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect username or password",
      headers={"WWW-Authenticate": "Bearer"},
    )
  access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = create_access_token(
    data={"sub": user['username']}, expires_delta=access_token_expires
  )
  return {
    "access_token": access_token, 
    "token_type": "Bearer",
    "uuid": user['uuid'],
    "role": user['role'], 
    "name": user['name'],
    "expires_in": access_token_expires.total_seconds()
  }

# Add more routes as needed for authentication and user management
