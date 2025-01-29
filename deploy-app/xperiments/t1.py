from collections import OrderedDict
import yaml

###################################
# 1. Custom Constructors & Representers
###################################

def ordered_dict_constructor(loader, node):
    """
    Parse YAML mappings into OrderedDict instead of plain dict.
    """
    loader.flatten_mapping(node)
    return OrderedDict(loader.construct_pairs(node))

def represent_ordereddict(dumper, data):
    """
    Preserve insertion order for OrderedDict items on dump.
    """
    return dumper.represent_dict(data.items())

def represent_sequence_flow(dumper, data):
    """
    Force every list to be emitted in flow style: [a, b, c].
    """
    return dumper.represent_sequence('tag:yaml.org,2002:seq', data, flow_style=True)

def str_presenter(dumper, data):
    """
    If a string contains a newline, dump it using literal block style.
    """
    if "\n" in data:
        print(f'MULTILINE: {data}')  # Debug print for multiline detection
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
    return dumper.represent_scalar('tag:yaml.org,2002:str', data)

# Register custom constructors and representers before any YAML operations
yaml.SafeLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
    ordered_dict_constructor
)
yaml.add_representer(OrderedDict, represent_ordereddict)
yaml.add_representer(list, represent_sequence_flow)
yaml.add_representer(str, str_presenter)

###################################
# 2. Main Logic
###################################

if __name__ == '__main__':
    FN = "./deploy-app/xperiments/input.yaml"       # Input file
    OUTPUT = "./deploy-app/xperiments/output.yaml"  # Output file

    # --- LOAD ---
    with open(FN, 'r') as file:
        data = yaml.safe_load(file)  # Load YAML as OrderedDict

    app_type = data['application'].get('type', 'edge')

    # Insert or manipulate new version data
    if app_type == 'k8s':
        new_version_entry = {
            "backend": {"image": "test1"},
            "frontend": {"image": "test2"},
            # Ensure summary contains actual newline characters
            "summary": "some feature \n second line multiline\n"
        }
    else:
        new_version_entry = {
            "summary": "some feature \n multi line\n"
        }

    version_name = '10.10.10'

    existing_versions = data['application'].get('versions', OrderedDict())

    # Insert new version at the top
    new_versions = OrderedDict()
    new_versions[version_name] = new_version_entry
    for k, v in existing_versions.items():
        new_versions[k] = v

    data['application']['versions'] = new_versions

    # --- SAVE ---
    with open(OUTPUT, 'w') as file:
        yaml.dump(data, file, sort_keys=False)
