import base64

from fastapi import APIRouter, Depends, HTTPException

from backend.constants import ADMIN_ROLE
from .auth import get_current_active_admin, get_current_user
from backend.storage_engines import CsvStorage, StorageProxy
from backend.models import UpdateUser, User

router = APIRouter(prefix="/users")

storage_proxy = StorageProxy(CsvStorage('users.csv'))

@router.delete("/{uuid}")
async def delete_user(uuid: str, current_user: User = Depends(get_current_active_admin)):
  if current_user['role'] != ADMIN_ROLE:
    raise HTTPException(status_code=403, detail="Insufficient permissions")

  storage_proxy.delete_user(uuid)
  return {"message": "User deleted successfully"}

@router.post("/", response_model=User)
async def create_user(user: User, current_user: User = Depends(get_current_active_admin)):
  if current_user['role'] != ADMIN_ROLE:
    raise HTTPException(status_code=403, detail="Insufficient permissions")

  # encode username to base64 string
  user.username = base64.b64encode(user.username.encode()).decode()

  storage_proxy.write_user(user.dict())
  return user

@router.get("/{uuid}", response_model=User)
async def get_user(uuid: str, current_user: User = Depends(get_current_user)):
  if current_user['role'] != ADMIN_ROLE and current_user['uuid'] != uuid:
      raise HTTPException(status_code=403, detail="Insufficient permissions")
  user = storage_proxy.find_user(uuid)
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  return user

@router.put("/{uuid}", response_model=UpdateUser)
async def update_user(uuid: str, user: UpdateUser, current_user: User = Depends(get_current_user)):
  if current_user['role'] != ADMIN_ROLE and current_user['uuid'] != uuid:
    raise HTTPException(status_code=403, detail="Insufficient permissions")

  # encode username to base64 string
  user.username = base64.b64encode(user.username.encode()).decode()

  storage_proxy.update_user(uuid, user.dict())
  return user

@router.get("/")
async def get_users(current_user: User = Depends(get_current_active_admin)):
  if current_user['role'] != ADMIN_ROLE:
    raise HTTPException(status_code=403, detail="Insufficient permissions")
  return storage_proxy.read_users()

# Add more user-related endpoints as necessary
