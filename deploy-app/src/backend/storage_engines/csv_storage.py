import base64
import os
import csv
from typing import List, Dict
import uuid
import bcrypt

from backend.storage_engines.storage_interface import StorageInterface
from backend.constants import STORAGE_DIR
from backend.models import User


class CsvStorage(StorageInterface):
  def __init__(self, users_file: str = None, tags_file: str = None):
    self.users_file = os.path.join(STORAGE_DIR, users_file) if users_file else None

  def _encode_password(self, password: str) -> str:
    password_bytes = password.encode('utf-8')
    password_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return password_hash.decode('utf-8')
  
  def _match_password(self, password: str, hashed_password: str) -> bool:
    password_bytes = password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_password_bytes)

  def read_users(self) -> List[Dict]:
    with open(self.users_file, mode='r') as file:
      return list(csv.DictReader(file))

  def write_user(self, user_data: Dict) -> None:
    if not user_data.get('uuid'):  # Check if 'uuid' is None or not present
        user_data['uuid'] = str(uuid.uuid4())  # Generate a new UUID v4 and assign it

    # hash user password
    if 'password' in user_data and isinstance(user_data['password'], str):
      user_data['password'] = self._encode_password(user_data['password'])

    with open(self.users_file, mode='a', newline='') as file:  # Added newline='' to prevent blank lines in Windows
        writer = csv.DictWriter(file, fieldnames=User(**user_data).__dict__.keys())
        if file.tell() == 0:  # Write header if the file is empty
            writer.writeheader()
        writer.writerow(user_data)
  
  def delete_user(self, uuid: str) -> None:
    users = self.read_users()
    with open(self.users_file, mode='w') as file:
      writer = csv.DictWriter(file, fieldnames=users[0].keys())
      writer.writeheader()
      for user in users:
        if user['uuid'] != uuid:
          writer.writerow(user)

  def authenticate_user(self, username: str, password: str):
    users = self.read_users()
    encoded_username = base64.b64encode(username.encode()).decode()
    encoded_password = self._encode_password(password)

    for user in users:
      if user['username'] == encoded_username:
        if not self._match_password(password, user['password']):
          raise ValueError('Invalid username/password combination')
        # remove the password from the user data
        user.pop('password')
        return user
    return None

  def read_user(self, username: str):
    users = self.read_users()
    for user in users:
      if user['username'] == username:
        # remove the password from the user data
        user.pop('password')
        return user
    return None
  
  def find_user(self, uuid: str):
    users = self.read_users()
    for user in users:
      if user['uuid'] == uuid:
        # remove the password from the user data
        user['password'] = '[REDACTED]'
        return user
    return None
  
  def update_user(self, uuid: str, user_data: Dict):
    users = self.read_users()
    updated = False

    for user in users:
        if user['uuid'] == uuid:
            # Update password only if it's provided
            if 'password' in user_data and user_data['password']:
                user_data['password'] = self._encode_password(user_data['password'])
            else:
                user_data['password'] = user['password']

            user.update(user_data)
            updated = True

    if updated:
        with open(self.users_file, mode='w') as file:
            writer = csv.DictWriter(file, fieldnames=users[0].keys())
            writer.writeheader()
            for user in users:
                writer.writerow(user)

    # Return the updated user, ensuring sensitive information like password is not included
    return self.find_user(uuid)
