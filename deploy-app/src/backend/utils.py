
def log_with_color(message, color):
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
  start_color = color_codes.get(color, "\033[90m")
  end_color = "\033[0m"
  print(f"{start_color}{message}{end_color}", flush=True)
  return


def get_version():
  """
    Get the version of the application.
    :return: Version of the application
  """
  with open("ver.txt") as version_file:
    return version_file.read().strip()