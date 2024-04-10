from backend.storage_engines.storage_interface import StorageInterface


class StorageProxy:
  def __init__(self, storage: StorageInterface):
    self.storage = storage

  def read_users(self):
    return self.storage.read_users()

  def write_user(self, user_data):
    self.storage.write_user(user_data)

  def authenticate_user(self, username, password):
    return self.storage.authenticate_user(username, password)

  def read_user(self, username: str):
    return self.storage.read_user(username)
  
  def find_user(self, uuid: str):
    return self.storage.find_user(uuid)
  
  def update_user(self, uuid: str, user_data):
    return self.storage.update_user(uuid, user_data)

  def delete_user(self, uuid: str):
    return self.storage.delete_user(uuid)
