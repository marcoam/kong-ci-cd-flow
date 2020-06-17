#!/bin/sh

source env.sh

# create and label the kuma namespace, so kuma will inject sidecars
kubectl create namespace $NAMESPACE

# replace @'s and _'s with -
VALID_SECRET_NAME=$(echo $BINTRAY_USER | sed -e "s/@/-/g")
VALID_SECRET_NAME=$(echo $VALID_SECRET_NAME | sed -e "s/_/-/g")

# create ConfigMap for mocking plugin
pushd ../kong-plugin-mocking/kong/plugins
kubectl create configmap kong-plugin-mocking --from-file=mocking -n $NAMESPACE
popd

# create the k4k8s enterprise secret
kubectl create secret -n $NAMESPACE docker-registry kong-enterprise-edition-docker \
    --docker-server=kong-docker-kong-enterprise-edition-docker.bintray.io \
    --docker-username=$BINTRAY_USER \
    --docker-password=$BINTRAY_PASSWORD

# create the Kong EE license secret
kubectl create secret generic kong-enterprise-license --from-file=./license -n $NAMESPACE

echo "Deploying Kong EE..."
pushd ../deploy
helm install $RELEASE kong/kong \
--values kong-ee/values.yaml -n $NAMESPACE \
--set ingressController.installCRDs=false

popd
echo "Waiting for Kong EE to start..."
python wait.py -n $NAMESPACE -c 2 -l job-name!=$RELEASE-kong-init-migrations

# enable dev portal on default workspace
curl -X PATCH http://localhost:8001/workspaces/default \
 --data "config.portal=true"