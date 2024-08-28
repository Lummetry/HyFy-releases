from typing import List
from jsonschema import ValidationError
import yaml
import os
import logging
from distutils.version import StrictVersion
from collections import OrderedDict

from backend.models import TagData
from backend.services.git_service import GitService  # Adjust the import path as necessary
from backend.constants import RELEASE_FILE_NAME, RELEASE_TEMPLATE_FILE_NAME, VERSIONS_FILE_NAME
from backend.exceptions.git_operation_exception import GitOperationException

from backend.utils import log_with_color

def represent_ordereddict(dumper, data):
    return dumper.represent_dict(data.items())

yaml.add_representer(OrderedDict, represent_ordereddict)

logger = logging.getLogger(__name__)

class GitOperationsService:
    def __init__(self, repo_name, local_repo_path=None, config_file_path=None):
        self.git_service = GitService(repo_name)
        if local_repo_path is None:
            self.local_repo_path = self.git_service._get_default_repo_path()
        else:
            self.local_repo_path = local_repo_path
        self.config_file_path = config_file_path

    def update_and_push_changes(self, tag_data_list: List[TagData], user=None):
      try:
        # first step check if any action is running and raise error
        if self.git_service.check_github_actions_running():
          raise GitOperationException("Cannot commit changes while GitHub Actions are running")
        self.prepare_repository()
        # precedence_check, violation_info = self.check_tag_precedence(tag_data)
        # if not precedence_check:
        #     raise ValueError(f"Evironment precedence violation: Attempting to set version '{tag_data.tag}' for '{tag_data.environment}' exceeds version '{violation_info['current_version']}' set in '{violation_info['env']}' environment.")
        # self.update_configuration_file(tag_data)
        # committing_user = user['name'] if user else 'Unknown User'
        # commit_message = f'chore: {tag_data.fromVersion} to {tag_data.toVersion} {committing_user} for {tag_data.directory} {tag_data.environment}'
        # self.git_service.git_commit(repo_path=self.local_repo_path, message=commit_message)
        # self.git_service.git_push(self.local_repo_path)

        # get a list of all environment from the tag_data_list
        environments = list(set([tag.environment for tag in tag_data_list]))
        log_with_color(f"Environments: {environments}", color='yellow')

        committing_user = user['name'] if user else 'Unknown User'
        commit_message = f"auto: {committing_user} updating versions for {', '.join(environments)} environments\n\n"

        for tag_data in tag_data_list:
            self.update_configuration_file(tag_data)
            # append to commit message
            msg = f"Promoting {tag_data.fromVersion} to {tag_data.toVersion} for {tag_data.directory}/{tag_data.environment}\n"
            log_with_color(msg, "yellow")
            commit_message += msg

        self.git_service.git_commit(repo_path=self.local_repo_path, message=commit_message)
        self.git_service.git_push(self.local_repo_path)
        log_with_color("Changes committed and pushed successfully", "green")
      except GitOperationException as e:
        log_with_color(f"ERROR: Git operation failed: {e}", color='red')
        logger.error(f"Git operation failed: {e}")
        raise
      except Exception as e:
        logger.error(f"Failed to update and push changes: {str(e)}")
        raise


    def prepare_repository(self):
        try:
            if not os.path.exists(self.local_repo_path):
                self.git_service.git_clone(self.local_repo_path)
            self.git_service.git_pull(self.local_repo_path)
        except GitOperationException as e:
            logger.error(f"Git operation failed during repository preparation: {e}")
            raise

    def update_configuration_file(self, tag_data):
        config_file = os.path.join(self.local_repo_path, self.config_file_path)

        try:
            with open(config_file, 'r') as file:
                config = yaml.load(file, Loader=yaml.FullLoader)
                
                for env in config['application']['envs']:
                    if env['name'] == tag_data.environment:
                        env['version'] = tag_data.tag
                        break

                with open(config_file, 'w') as file:
                    yaml.dump(config, file, Dumper=yaml.Dumper)
        except Exception as e:
            logger.error(f"Failed to update configuration file {config_file}: {e}")
            raise
    
    def check_tag_list_precedence(self, tag_data_list):
      log_with_color(f"Checking tag precedence for {tag_data_list}", color='yellow')
      
      # Load configuration and precedence rules
      config_file = os.path.join(self.local_repo_path, self.config_file_path)
      with open(config_file, 'r') as file:
          config = yaml.safe_load(file)

      versions_file = os.path.join(self.local_repo_path, tag_data_list[0].directory, VERSIONS_FILE_NAME)
      app_name, precedence, versions = None, [], None
      with open(versions_file, 'r') as file:
        versions = yaml.safe_load(file)
        precedence = versions['application'].get('envs', [])
        app_name = versions['application'].get('name', '')
      log_with_color(f"Precedence for {app_name}: {precedence}", color='yellow')
      # Dictionary to maintain current versions for easy access and modification
      current_versions = {env['name']: env['version'] for env in config['application']['envs']}
      violations = []

      for tag_data in tag_data_list:
          proposed_version = StrictVersion(tag_data.toVersion)
          # Get the index for the current environment's precedence
          env_index = precedence.index(tag_data.environment)
          # Check against all higher precedence environments
          for env in precedence[:env_index]:  # Only check environments before the current one in the list
              higher_version_str = current_versions.get(env)
              if higher_version_str and StrictVersion(higher_version_str) < proposed_version:
                  violations.append({
                      'higher_env': env,
                      'higher_version': higher_version_str,
                      'proposed_env': tag_data.environment,
                      'proposed_version': tag_data.toVersion,
                      'error': f"Proposed version {proposed_version} for {tag_data.environment} exceeds {env}'s version {higher_version_str}"
                  })
                  break  # Stop further checks for this tag as a violation is found

          # Update in-memory state only if no violations were found for this tag
          if not any(vio['proposed_env'] == tag_data.environment for vio in violations):
              current_versions[tag_data.environment] = tag_data.toVersion

      if violations:
          return False, violations
      else:
          return True, "All tags updated successfully according to precedence"




    def check_tag_precedence(self, tag_data):
      log_with_color(f"Checking tag precedence for {tag_data.tag} in {tag_data.environment}, {self.config_file_path}", color='yellow')
      config_file = os.path.join(self.local_repo_path, self.config_file_path)
      with open(config_file, 'r') as file:
          config = yaml.safe_load(file)

      # Get the order of the environments from the versions file
      precedence = []
      versions_file = os.path.join(self.local_repo_path, tag_data.directory, VERSIONS_FILE_NAME)
      with open(versions_file, 'r') as file:
          versions = yaml.safe_load(file)
          precedence = versions['application'].get('envs', [])
      
      proposed_version = StrictVersion(tag_data.tag)
      violation_info = {}
      for env in precedence:
          if env == tag_data.environment:
              break  # No need to check versions for the same or lower environments

          # Find the current version for the environment in the config file
          current_version_str = None
          for env_obj in config['application']['envs']:
              if env_obj['name'] == env:
                  current_version_str = env_obj['version']
                  break

          if current_version_str and StrictVersion(current_version_str) < proposed_version:
              violation_info = {'env': env, 'current_version': current_version_str, 'proposed_version': proposed_version}
              return False, violation_info  # Precedence violated
          
      return True, None  # Precedence maintained

    
    def find_release_files(self):
        directories_with_release = []
        for root, dirs, files in os.walk(self.local_repo_path, topdown=True):
            dirs[:] = [d for d in dirs if not d.startswith('.')]  # Ignore hidden directories
            if RELEASE_FILE_NAME in files:
                release_file_path = os.path.join(root, RELEASE_FILE_NAME)
                with open(release_file_path, 'r') as file:
                    release_data = yaml.safe_load(file)
                app_info = {
                    'directory_name': os.path.basename(root),
                    'application_name': release_data.get('application', {}).get('name', ''),
                    'application_type': release_data.get('application', {}).get('type', 'edge')
                }
                directories_with_release.append(app_info)
        return directories_with_release
    
    def _create_default_release_file(self, directory_name: str):
        """
        Creates a default release.yaml file for the specified directory.
        This method will use a template to create the file.
        """
        template_file_path = os.path.join(self.local_repo_path, directory_name, RELEASE_TEMPLATE_FILE_NAME)
        release_file_path = os.path.join(self.local_repo_path, directory_name, RELEASE_FILE_NAME)

        try:
            with open(template_file_path, 'r') as template_file:
                template_data = yaml.safe_load(template_file)
                template_data['application']['name'] = directory_name
                with open(release_file_path, 'w') as release_file:
                    yaml.dump(template_data, release_file, Dumper=yaml.Dumper)
        except FileNotFoundError as e:
            raise FileNotFoundError(f"The file {template_file_path} does not exist.")
    
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
                self._create_default_release_file(directory_name)
        except FileNotFoundError as e:
            print(f"Error: {e}")
            raise e
        except yaml.YAMLError as e:
            print(f"Error parsing YAML file: {e}")
            raise e

        # Return an empty dictionary if the file does not exist or an error occurs
        return {}
    
    def find_version_files(self):
        directories_with_release = []
        for root, dirs, files in os.walk(self.local_repo_path, topdown=True):
            dirs[:] = [d for d in dirs if not d.startswith('.')]  # Ignore hidden directories
            if VERSIONS_FILE_NAME in files:
                release_file_path = os.path.join(root, VERSIONS_FILE_NAME)
                with open(release_file_path, 'r') as file:
                    release_data = yaml.safe_load(file)
                app_info = {
                    'directory_name': os.path.basename(root),
                    'application_name': release_data.get('application', {}).get('name', ''),
                    'application_type': release_data.get('application', {}).get('type', 'edge')
                }
                directories_with_release.append(app_info)
        return directories_with_release

    def get_versions_file_contents(self, directory_name: str) -> dict:
        """
        Retrieves the contents of the versions.yaml file from the specified directory.

        :param directory_name: The name of the directory to search for the versions.yaml file.
        :return: The contents of the versions.yaml file as a dictionary.
        """
        # Construct the path to the versions.yaml file within the specified directory
        release_file_path = os.path.join(self.local_repo_path, directory_name, VERSIONS_FILE_NAME)

        try:
            if os.path.exists(release_file_path):
                with open(release_file_path, 'r') as file:
                    return yaml.safe_load(file)
            else:
                raise FileNotFoundError(f"The file {release_file_path} does not exist.")
        except FileNotFoundError as e:
            print(f"Error: {e}")
            raise e
        except yaml.YAMLError as e:
            print(f"Error parsing YAML file: {e}")
            raise e

        # Return an empty dictionary if the file does not exist or an error occurs
        return {}
