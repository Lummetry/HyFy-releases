"""
This script will perform a tree search of the target folder and dump all the files content into a single file called 'dump.txt' with the format

```<folder>/<file 1>:
<content>
```
================================================================================================
```<folder>/<file 2>:
<content>
```
...

"""
import os

if __name__ == '__main__':
  FOLDER = 'deploy-app'
  with open('dump.txt', 'w') as f:
    for root, dirs, files in os.walk(FOLDER):      
      for file in files:
        print(f"ROOT: {root}, FILE: {file}")
        if file.startswith(('.',)) or file.endswith(('.png','.jpg', '.json')) or file in ['dump.txt', 'dumper.py']:
          continue
        fn = os.path.join(root, file)
        with open(fn, 'r') as fh:
          f.write(f'```{fn}:\n{fh.read()}\n```\n================================================================================================\n')
  