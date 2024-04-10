import yaml
import os
from distutils.version import StrictVersion
from collections import OrderedDict

from backend.models import TagData
from backend.services.git_service import GitService  # Adjust the import path as necessary
from backend.constants import RELEASE_FILE_NAME

def represent_ordereddict(dumper, data):
    return dumper.represent_dict(data.items())

yaml.add_representer(OrderedDict, represent_ordereddict)

class GitOperationsService:
    def __init__(self, repo_name, local_repo_path=None, config_file_path=None):
        self.git_service = GitService(repo_name)
        if local_repo_path is None:
            self.local_repo_path = self.git_service._get_default_repo_path()
        else:
            self.local_repo_path = local_repo_path
        self.config_file_path = config_file_path

    def update_and_push_changes(self, tag_data: TagData, user=None):
        self.prepare_repository()
        if not self.check_tag_precedence(tag_data):
            raise ValueError(f"The provided tag does not respect the precedence rule.")
        self.update_configuration_file(tag_data)
        commiting_user = user['name']
        commit_message = f'chore: configuration updated by {commiting_user} for {tag_data.directory} {tag_data.environment} environment'
        self.git_service.git_commit(repo_path=self.local_repo_path, message=commit_message)
        self.git_service.git_push(self.local_repo_path)

    def prepare_repository(self):
        if not os.path.exists(self.local_repo_path):
            self.git_service.git_clone(self.local_repo_path)
        self.git_service.git_pull(self.local_repo_path)

    def update_configuration_file(self, tag_data):
        config_file = os.path.join(self.local_repo_path, self.config_file_path)

        with open(config_file, 'r') as file:
            config = yaml.load(file, Loader=yaml.FullLoader)

        env_order = ['staging', 'qa', 'preprod', 'prod']

        # Create an OrderedDict to preserve the order
        ordered_envs = OrderedDict()
        for env in env_order:
            ordered_envs[env] = config['application']['envs'].get(env, '')

        # Update the specific environment value
        ordered_envs[tag_data.environment] = tag_data.tag

        # Update the config dictionary with the ordered environments
        config['application']['envs'] = ordered_envs

        with open(config_file, 'w') as file:
            yaml.dump(config, file, Dumper=yaml.Dumper)

    def check_tag_precedence(self, tag_data):
        config_file = os.path.join(self.local_repo_path, self.config_file_path)
        with open(config_file, 'r') as file:
            config = yaml.safe_load(file)
        
        env_order = ['staging', 'qa', 'preprod', 'prod']
        proposed_version = StrictVersion(tag_data.tag)
        for env in env_order:
            if env == tag_data.environment:
                break  # No need to check versions for the same or lower environments
            current_version_str = config['application']['envs'].get(env)
            if current_version_str and StrictVersion(current_version_str) < proposed_version:
                return False  # Precedence violated
        
        return True  # Precedence maintained
    
    def find_release_files(self):
        directories_with_release = []
        for root, dirs, files in os.walk(self.local_repo_path, topdown=True):
            dirs[:] = [d for d in dirs if not d.startswith('.')]  # Ignore hidden directories
            if 'release.yaml' in files:
                release_file_path = os.path.join(root, 'release.yaml')
                with open(release_file_path, 'r') as file:
                    release_data = yaml.safe_load(file)
                app_info = {
                    'directory_name': os.path.basename(root),
                    'application_name': release_data.get('application', {}).get('name', ''),
                    'application_type': release_data.get('application', {}).get('type', 'edge')
                }
                directories_with_release.append(app_info)
        return directories_with_release
    
    def get_release_file_contents(self, directory_name: str) -> dict:
        """
        Retrieves the contents of the release.yaml file from the specified directory.

        :param directory_name: The name of the directory to search for the release.yaml file.
        :return: The contents of the release.yaml file as a dictionary.
        """
        # Construct the path to the release.yaml file within the specified directory
        release_file_path = os.path.join(self.local_repo_path, directory_name, RELEASE_FILE_NAME)

        try:
            if os.path.exists(release_file_path):
                with open(release_file_path, 'r') as file:
                    return yaml.safe_load(file)
            else:
                raise FileNotFoundError(f"The file {release_file_path} does not exist.")
        except FileNotFoundError as e:
            print(f"Error: {e}")
        except yaml.YAMLError as e:
            print(f"Error parsing YAML file: {e}")

        # Return an empty dictionary if the file does not exist or an error occurs
        return {}
