from typing import Optional
from pydantic import BaseModel


# User model
class User(BaseModel):
  uuid: Optional[str] = None
  username: str
  password: str 
  name: Optional[str] = None
  role: str  # Example roles could be 'admin', 'user', etc.

class UpdateUser(BaseModel):
  username: Optional[str] = None
  password: Optional[str] = None
  name: Optional[str] = None
  role: Optional[str] = None


# Token model for JWT responses
class Token(BaseModel):
  access_token: str
  token_type: str
  expires_in: int
  uuid: str
  role: str
  name: str


# Token data for decoding JWT payloads
class TokenData(BaseModel):
  username: Optional[str] = None

class TagData(BaseModel):
  tag: str
  directory: str
  environment: str
  fromVersion: Optional[str] = None
  toVersion: Optional[str] = None


class NewVersionData(BaseModel):
    directory: str
    version: str
    summary: str
    backend: Optional[str] = None
    frontend: Optional[str] = None