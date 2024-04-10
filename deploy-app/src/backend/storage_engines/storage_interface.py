from abc import ABC, abstractmethod
from typing import List, Dict


class StorageInterface(ABC):
  @abstractmethod
  def read_users(self) -> List[Dict]:
    pass

  @abstractmethod
  def write_user(self, user_data: Dict) -> None:
    pass

  @abstractmethod
  def authenticate_user(self, username: str, password: str):
    pass

  @abstractmethod
  def read_user(self, uuid: str):
    pass

  @abstractmethod
  def find_user(self, uuid: str):
    pass

  @abstractmethod
  def update_user(self, uuid: str, user_data: Dict):
    pass

  @abstractmethod
  def delete_user(self, uuid: str):
    pass
