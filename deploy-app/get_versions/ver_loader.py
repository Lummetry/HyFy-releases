import yaml
import requests
import os
import json
from copy import deepcopy



CONFIG_FILE = 'config.yaml' # Configuration file path
LOCAL_VERSION_FILE = 'saved_versions.json' # Local versions file path

# Default (working) configuration tha can be overridden by the config.yaml file
CONFIG = {
  "e2": {
    "image": "exe_eng",
    "url": "https://github.com/Lummetry/HyFy-releases/tree/main/e2",
    "env": "prod"
  },
  "lms": {
    "image": "hyfy_lms",
    "url": "https://github.com/Lummetry/HyFy-releases/tree/main/lms",
    "env": "prod"
  },
  "preventics": {
    "url": "https://github.com/Lummetry/HyFy-releases/tree/main/preventics",
    "env": "prod"
  },
}

def print_with_color(text, color):
  """Print the text in the specified color.

  Parameters
  ----------
  text : str
    The text to print.
  color : str
    The color to use for printing.
  """
  colors = {
    "red": "\033[91m",
    "green": "\033[92m",
    "yellow": "\033[93m",
    "blue": "\033[94m",
    "purple": "\033[95m",
    "cyan": "\033[96m",
    "white": "\033[97m",
    "reset": "\033[0m"
  }
  print(f"{colors[color]}{text}{colors['reset']}", flush=True)
  return

def load_config():
  """
  Loads the configuration from the config.yaml file.
  
  If the file is not found or there is an error loading the file, the default configuration is returned.

  Returns
  -------
  dict
    The configuration dictionary.
  """
  try:
    print_with_color(f"Loading config {CONFIG_FILE}", "cyan")
    with open(CONFIG_FILE, 'r') as file:
      return yaml.safe_load(file)
  except Exception as e:
    print_with_color(f"Error loading config: {e}, reverting to default configuration", "red")
    return CONFIG


def download_file(url):
  """Download a file from the provided URL.

  Parameters
  ----------
  url : str
    The URL to the file.

  Returns
  -------
  str
    The content of the downloaded file.
  """
  # print_with_color(f"Downloading file from {url}", "cyan")
  response = requests.get(url)
  response.raise_for_status()
  # print_with_color(f"Downloaded file from {url}", "green")
  return response.text

def load_yaml_from_url(url):
  """Load YAML content from a URL.

  Parameters
  ----------
  url : str
    URL pointing to the raw YAML file.

  Returns
  -------
  dict
    The loaded YAML content.
  """
  yaml_content = download_file(url)
  return yaml.safe_load(yaml_content)

def get_prod_version(release_data, env_name):
  """Extract the production version from the release.yaml data.

  Parameters
  ----------
  release_data : dict
    The parsed YAML data from release.yaml.
  env_name : str
    The environment name to match (e.g., 'prod').

  Returns
  -------
  str or None
    The version string if found, otherwise None.
  """
  for env in release_data['application']['envs']:
    if env['name'] == env_name:
      return env['version']
  return None

def extract_images_for_version(version_data, version):
  """Extract backend and frontend images for a specific version.

  Parameters
  ----------
  version_data : dict
    The parsed YAML data from versions.yaml.
  version : str
    The version to extract images for.

  Returns
  -------
  dict
    A dictionary with image names for backend and frontend.
  """
  version_info = version_data['application']['versions'].get(version, {})
  return {
    "backend": version_info['backend']['image'],
    "frontend": version_info['frontend']['image']
  }

def convert_github_url_to_raw(url, filename):
  """Convert a GitHub directory URL to a raw file URL.

  Parameters
  ----------
  url : str
    The GitHub directory URL.
  filename : str
    The filename to access in the directory.

  Returns
  -------
  str
    The raw file URL.
  """
  url = url.replace("github.com", "raw.githubusercontent.com")
  url = url.replace("tree/", "")
  return f"{url}/{filename}"


def save_local_versions(file_path, data):
  """Save the current versions to a JSON file.

  Parameters
  ----------
  file_path : str
    Path to the JSON file.
  data : dict
    The data to save in the file.

  """
  print_with_color(f"Saving local versions to {file_path}", "cyan")
  with open(file_path, 'w') as file:
    json.dump(data, file, indent=2)
  return
    
    
def load_local_versions(file_path):
  """Load the locally saved versions from a JSON file.

  Parameters
  ----------
  file_path : str
    Path to the JSON file.

  Returns
  -------
  dict
    The loaded versions from the file.
  """
  data = {}
  if os.path.exists(file_path):
    with open(file_path, 'r') as file:      
      data = json.load(file)     
      print_with_color(f"Loaded local versions from {file_path}:\n{json.dumps(data, indent=2)}", "white") 
  else:
    print_with_color(f"Local versions file not found: {file_path}", "yellow")
  return data    


def build_output(config, local_versions):
  """Build the output dictionary based on config, release.yaml, and versions.yaml.

  Parameters
  ----------
  config : dict
    The configuration dictionary.
  local_versions : dict
    The locally saved versions.

  Returns
  -------
  dict
    The constructed output dictionary with requires_update flags.
  """
  output = {}
  current_versions = {}

  for app_name, app_info in config.items():
    image_name = app_info.get("image", app_name)
    env_name = app_info["env"]
    base_url = app_info["url"]
    print_with_color(f"Processing {app_name} for {env_name} environment", "cyan")
    
    # Convert GitHub URL to raw URLs for the YAML files
    release_url = convert_github_url_to_raw(base_url, 'release.yaml')
    versions_url = convert_github_url_to_raw(base_url, 'versions.yaml')
    
    # Load release.yaml and versions.yaml from the URLs
    release_data = load_yaml_from_url(release_url)
    version_data = load_yaml_from_url(versions_url)
    
    # Get the production version from release.yaml
    prod_version = get_prod_version(release_data, env_name)
    
    # Get the application type
    app_type = release_data['application']['type']
    
    if app_type == 'k8s':
      images = extract_images_for_version(version_data, prod_version)
      output[image_name] = {
        "backend": images["backend"],
        "frontend": images["frontend"]
      }
    else:
      output[image_name] = {
        "default": f"aixpand/{image_name}:{prod_version}"
      }
    
    # Save the current version information
    current_versions[image_name] = output[image_name]
    
    dct_check_current = deepcopy(current_versions[image_name])
    dct_check_current.pop("requires_update", None)
    
    dct_check_local = deepcopy(local_versions.get(image_name, {}))
    dct_check_local.pop("requires_update", None)
    
    # Check for update requirement
    if dct_check_local == dct_check_current:
      output[image_name]["requires_update"] = False
      print_with_color(f"Update NOT required for {image_name}: {dct_check_local} == {dct_check_current}", "green")
    else:
      output[image_name]["requires_update"] = True
      print_with_color(f"Update required for {image_name}: {dct_check_local} <> {dct_check_current}", "yellow")

  # Save the current versions to the local JSON file
  save_local_versions(LOCAL_VERSION_FILE, current_versions)

  return output



if __name__ == "__main__":
  # Load last saved versions
  local_versions = load_local_versions(LOCAL_VERSION_FILE)
  
  # Build the output
  output = build_output(CONFIG, local_versions)
  
  # Print or use the output dictionary as needed
  print(json.dumps(output, indent=2))
