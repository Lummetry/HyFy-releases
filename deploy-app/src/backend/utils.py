import requests
import datetime

def log_with_color(message, color="gray"):
  """
    Log message with color in the terminal.
    :param message: Message to log
    :param color: Color of the message
  """
  color_codes = {
    "yellow": "\033[93m",
    "red": "\033[91m",
    "gray": "\033[90m",
    "light": "\033[97m",
    "green": "\033[92m"
  }
  timestamp = datetime.datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
  start_color = color_codes.get(color, "\033[90m")
  end_color = "\033[0m"
  print(f"{start_color}{timestamp} {message}{end_color}", flush=True)
  return

def get_github_actions(repo_name: str, include_filter: str = ['in_progress'], exclude_filter: str = ['completed']) -> list:
  """
  Checks if there are any running GitHub Actions in the specified public repository.

  Parameters
  ----------
  repo_name : str
      The repository name in the format "owner/repo".
      
  include_filter : list
      List of GitHub Action statuses to include in the check.
      
  exclude_filter : list
      List of GitHub Action statuses to exclude from the check.

  Returns
  -------
  list
      List of GitHub Actions that are currently filtered, [] otherwise.
  """
  url = f"https://api.github.com/repos/{repo_name}/actions/runs"
  
  log_with_color(f"Checking for running GitHub Actions in {url} with include_filter:{include_filter}, exclude_filter: {exclude_filter}", "yellow")
  
  response = requests.get(url)
  
  if response.status_code != 200:
    raise Exception(f"Failed to fetch data from GitHub API: {response.status_code}")
  
  runs = response.json().get("workflow_runs", [])
  
  running_workflows = []
  any_running = False
  
  for run in runs:
    run_status = run.get('status')
    check_one = run_status in include_filter if len(include_filter) > 0 else True
    check_two = run_status not in exclude_filter if len(exclude_filter) > 0 else True
    if check_one and check_two:
      workflow_name = run.get('name')
      status = run.get('status')
      running_workflows.append((workflow_name, status))
      if status != 'completed':
        any_running = True
      
  if any_running:
    log_with_color(f"  GitHub Actions are currently running: {running_workflows}", "red")
  else:
    log_with_color("  No GitHub Actions are currently running", "green")
  return running_workflows


def get_version():
  """
    Get the version of the application.
    :return: Version of the application
  """
  with open("ver.txt") as version_file:
    return version_file.read().strip()
  


if __name__ == '__main__':
  result = get_github_actions(
    repo_name="Lummetry/HyFy-releases", 
    include_filter=[],
    exclude_filter=['completed'],
  )
  log_with_color(f"Result: {result}", "gray")