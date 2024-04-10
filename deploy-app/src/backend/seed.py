import base64
import sys
from backend.storage_engines import CsvStorage

if __name__ == '__main__':
    username = sys.argv[1] 
    encoded_username = base64.b64encode(username.encode()).decode()
    password = sys.argv[2]
    full_name = sys.argv[3]
    storage = CsvStorage('users.csv')
    storage.write_user({'username': encoded_username, 'password': password, 'role': 'admin', 'name': full_name})