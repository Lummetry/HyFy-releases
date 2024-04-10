NAMESPACE="hyfy-deploy-app"
DEPLOYMENT_NAME="hyfy-deploy-app-deployment"
SECRET_NAME="deploy-app-secrets"

# check if kubectl is installed
if ! command -v kubectl &> /dev/null
then
    echo "kubectl could not be found"
    exit 1
fi

# check if yq is installed
if ! command -v yq &> /dev/null
then
    echo "yq could not be found"
    exit 1
fi

# check if namespace exists on cluster if not apply it
if ! kubectl get namespace $NAMESPACE &> /dev/null
then
    echo "Namespace $NAMESPACE not found, applying it"
    kubectl apply -f ./src/namespace.yaml
fi

# check if secrets.yml exists, if not copy the .secrets.yml file to secrets.yml, and stop execution
if [ ! -f ./src/secrets.yml ]
then
    cp .secrets.yml ./src/secrets.yml
    echo "Please fill in the secrets in ./src/secrets.yml"
    exit 1
fi

# check if secret exists on cluster if not apply it
if ! kubectl get secret $SECRET_NAME -n $NAMESPACE &> /dev/null
then
    echo "Secret $SECRET_NAME not found, applying it"
    kubectl apply -f ./src/secrets.yaml
fi

# check if deployment exists on cluster if not apply it
if ! kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE &> /dev/null
then
    echo "Deployment $DEPLOYMENT_NAME not found, applying it"
    kubectl apply -f ./src/deploy.yaml
fi

# end of installation, print the status of the deployment
kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE
