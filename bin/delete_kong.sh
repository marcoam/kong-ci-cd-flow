#!/bin/sh

source env.sh

helm del $RELEASE -n $NAMESPACE

kubectl delete namespace $NAMESPACE