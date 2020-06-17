# gitops-demo

This repository provides a template for doing your own demonstration of the end to end lifecycle as depicted in the following diagram.

![e2e](https://kong-sales-engineering.s3.us-east-2.amazonaws.com/images/e2e.png)

Prerequisites
---
* Clone the [kong-plugin-mocking](https://github.com/Kong/kong-plugin-mocking) repository to your machine. 
* A running instance of Kong EE with the Developer Portal enabled in the default workspace. We are assuming a Docker install.
* Install [kong-portal-cli](https://github.com/Kong/kong-portal-cli)
* Install [Helm](http://helm.sh)
* Install PyYaml - pip install PyYaml

Steps for Creating a Running Demo
---
1. Create your own repository with this template
1. Clone your repository
1. Run `npm install` in your `$PROJECT_ROOT`
1. Create and run a self hosted Github Action Runner inside your `$PROJECT_ROOT`. 

![action](https://kong-sales-engineering.s3.us-east-2.amazonaws.com/images/action-gitops-demo.png)

Steps for Configuring Demo in Kubernetes
--
We are assuming you have a local Kubernetes cluster running in docker-desktop or minikube.

1. This demo utilizes the Developer Portal, so we are going to run Kong Enterprise on Kubernetes.
1. Put a valid license file called "license" inside your `$PROJECT_ROOT/bin` directory.
1. Create a symbolic link to the kong-plugin-mocking plugin inside `$PROJECT_ROOT`
   - `ln -s /path/to/kong-plugin-mocking .`.
1. From within the `bin` directory, run `./setup_kong.sh`. This may take a few minutes to complete. The `setup_kong.sh` script will wait for Kong to start and then will enable the Developer Portal after it is started. You should see the following in your terminal when it is finished.

```
{"comment":null,"created_at":1590088297,"config":{"portal_access_request_email":null,"portal_invite_email":null,"portal_reset_success_email":null,"portal_auth_conf":null,"portal_is_legacy":null,"portal_auth":null,"portal_developer_meta_fields":"[{\"label\":\"Full Name\",\"title\":\"full_name\",\"validator\":{\"required\":true,\"type\":\"string\"}}]","portal_auto_approve":null,"portal":true,"portal_token_exp":null,"portal_emails_reply_to":null,"portal_reset_email":null,"portal_approved_email":null,"portal_emails_from":null,"meta":null,"portal_session_conf":null,"portal_cors_origins":null},"id":"4639737f-d9bc-45c2-8c52-4e37a1627ba8","name":"default","meta":{"color":null,"thumbnail":null}}
```

Steps for Configuring Demo in Docker
--
1. Edit the `bin/add_mocking_plugin.sh` so you have the appropriate Docker containers in the `docker cp` and `exec` commands.
1. Run `add_mocking_plugin.sh`. ![local-plugin-edit](https://kong-sales-engineering.s3.us-east-2.amazonaws.com/images/local-plugin-edit.png)

The Golden Use Case
---
Once your Kong environment is up and running, we are ready to demonstrate the golden use case. In order to do so, we will edit an OpenAPI specification and push the changes to Github. After we push the changes, a 2-step Github Action workflow will execute. The first step will generate a Kong configuration file from the OpenAPI specification using our `openapi-2-kong` NodeJS library, and apply it to your running version of Kong using helm or decK. The second step will deploy the OpenAPI specification to the Developer Portal using the `portal` command line application.

Steps to Run in Kubernetes 
---
1. Configure workflow to use kong-for-kubernetes. Open `$PROJECT_ROOT/.github/workflows/main.yml` and edit the `kong-config-type` input. ![k4k8s-edit](https://kong-sales-engineering.s3.us-east-2.amazonaws.com/images/k4k8s-edit.png)
1. Open the `$PROJECT_ROOT/workspaces/default/specs/orders.yaml` file in your favorite text editor.
1. Edit the example response value however you like. For example, add a "zipcode" field. ![edit-oas](https://kong-sales-engineering.s3.us-east-2.amazonaws.com/images/edit_oas.png)
1. Commit and push your changes.

Steps to Run in Docker 
---
1. Configure workflow to use kong-declarative-config. Open `$PROJECT_ROOT/.github/workflows/main.yml` and edit the `kong-config-type` input. ![deck-edit](https://kong-sales-engineering.s3.us-east-2.amazonaws.com/images/deck-edit.png)
1. Open the `$PROJECT_ROOT/workspaces/default/specs/orders.yaml` file in your favorite text editor.
1. Edit the example response value however you like. For example, add a "zipcode" field. ![edit-oas](https://kong-sales-engineering.s3.us-east-2.amazonaws.com/images/edit_oas.png)
1. Commit and push your changes.

After your commit is pushed, the workflow will start. Once the job is complete, verify everything worked properly. Point your browser to Kong Manager on localhost and check to see if is configured properly. You should see a "LCE_Order_API" service, a "LCE_Order_API-path-get" route with the "mocking" plugin installed. You can also goto http://localhost/request/v1/order/ with the host header set to mockbin.org to view the example response specified in the orders OpenAPI specificatino.
