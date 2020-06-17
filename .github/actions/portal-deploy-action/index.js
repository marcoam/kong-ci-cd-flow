const core = require('@actions/core');
// const github = require('@actions/github');
const o2k = require('openapi-2-kong');
var fs = require('fs');
var yaml = require('yaml');

function createK8sConfig(spec, config) {
  var output = "";
  console.log("Ingress Name", config.ingressName);
  if (config.externalService) {
    const externalService = {
      kind: "Service",
      apiVersion: "v1",
      metadata: {
        name: config.externalService,
        namespace: config.namespace
      },
      spec: {
        type: "ExternalName",
        externalName: config.externalServiceHost
      }
    }
  
    output += yaml.stringify(externalService) + "---\n"
  }
  
  for (var i = 0; i < spec.documents.length; i++) {
    var kind = spec.documents[i];
    if (kind.metadata.name == config.ingressName) {
      kind.spec.rules[0].http.paths[0].backend.serviceName = config.externalService;
    }
    // workaorund until insomnia fixes "get"
    if (kind.kind == 'KongIngress') {
      kind.route.methods = kind.route.methods.map(item => item.toUpperCase());
    }
    kind.metadata.namespace = config.namespace;
    const unit = yaml.stringify(spec.documents[i]);
    output += unit + "---\n";
  }

  console.log("Wrote K8s config")
  return output;
}

function generate(config) {
  const configFormat = core.getInput('openapi-spec-format')
  const specObject = (configFormat == 'YAML') ? yaml.parse(config.spec) : JSON.parse(config.spec);
  console.log("Spec title: ", specObject.info.title)

  // enhance the configuration
  config.ingressName = specObject.info.title.toLowerCase().split(" ").join("-")

  const kongConfig = o2k.generateFromSpec(specObject, config.name, []);
  fs.writeFileSync(config.configFile, config.documentPicker(config, kongConfig), 'utf-8');

  const execSync = require('child_process').execFileSync;

  const uid = core.getInput('uid');
  const gid = core.getInput('gid');
  const res = execSync('./.github/actions/portal-deploy-action/' + config.deployCommand, {
    uid: +uid, gid: +gid, shell: true, env: process.env
  });
  console.log(res.toString('utf-8'));

}

try {
  const oas = core.getInput('openapi-spec');
  const configType = core.getInput('kong-config-type');
  const externalService = core.getInput('external-service') || false;
  const externalServiceHost = core.getInput('external-service-host') || false;
  const k8sNamesapce = core.getInput('k8s-namespace');
  const buf = fs.readFileSync('./workspaces/default/specs/' + oas, 'utf8');
  const config = {
    name: configType,
    configFile: "/tmp/kong.yaml",
    externalService: externalService,
    externalServiceHost: externalServiceHost,
    documentPicker: (config, kongConfig) => {
      return (config.name == 'kong-for-kubernetes') ? createK8sConfig(kongConfig, config) : yaml.stringify(kongConfig.documents[0]);
    },
    namespace: k8sNamesapce,
    deployCommand: (configType == 'kong-for-kubernetes') ? 'k8s_deploy.sh' : 'docker_deploy.sh',
    spec: buf,
  }
  generate(config)
  console.log("Finished")
} catch (error) {
  console.log(error)
  core.setFailed(error.message);
}
