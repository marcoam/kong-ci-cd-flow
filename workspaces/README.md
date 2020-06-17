# Spec based Automated GitOps for Kong

This integration takes Spec files to automate Kong configuration deployment via Actions. The integration provides:
* Deployment of Specs to Kong Development Portal
* Deployment of Kong configuration to expose, secure the APIs and enables mocking

## Requirements

1. Install the Kong Portal CLI:

```bash
$ git clone git@github.com:Kong/kong-portal-templates.git
$ cd kong-portal-templates
$ portal deploy default
```

2. Install npm pre-requisites:
```
npm init -y
npm install @actions/core
npm install @actions/github
npm i openapi-2-kong
```

3. he Kong Mocking plug-in is installed in your local environment 

4. Create a copy of this Github template in a new repository (your own Github is reecommended) 

5. Enable Actions in your Github repo and setup a self hosted Github runner by visiting Settings --> Actions.  

## Customization

To modify the portal CLI configuration, modify workspaces/default/cli.conf.yaml

## Assumptions

* The Kong environment is running locally in Docker (for the moment)
  * The declarative file produced from the openapi conversion is copied to the Docker image and loaded
* RBAC is disabled by default.  If RBAC is enabled, modify workspaces/default/cli.conf.yaml
* A Github Runner is running locally to allow the deployments to occur against the local deployment


   

