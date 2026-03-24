const fs = require('fs');
const path = require('path');
const appConfig = require('../config');

const configPath = path.join(__dirname, 'services.json');
const migrationConfigPath = path.join(__dirname, 'migration-services.json');
const templatesDir = path.join(__dirname, 'yaml-templates');
const outputDir = path.join(__dirname, 'ymls');
const deploymentsOutputDir = path.join(outputDir, 'deployments');
const networkingOutputDir = path.join(outputDir, 'networking');
const migrationsOutputDir = path.join(outputDir, 'migrations');

function loadConfig(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Unable to read or parse config file at ${filePath}: ${error.message}`);
  }
}

function loadOptionalConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return loadConfig(filePath);
}

function loadTemplate(templateName) {
  const templatePath = path.join(templatesDir, templateName);

  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(`Unable to read template file at ${templatePath}: ${error.message}`);
  }
}

function applyTemplate(template, values) {
  return Object.keys(values).reduce((content, key) => {
    return content.replaceAll(`{{${key}}}`, String(values[key]));
  }, template);
}

function clearOutputDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return;
  }

  fs.readdirSync(directoryPath).forEach((entry) => {
    const entryPath = path.join(directoryPath, entry);
    const stats = fs.statSync(entryPath);

    if (stats.isFile()) {
      fs.unlinkSync(entryPath);
    }
  });
}

function buildInitContainersBlock(commands, image) {
  if (!Array.isArray(commands) || commands.length === 0) {
    return '';
  }

  const lines = [
    '      initContainers:',
    '        - name: pre-start-commands',
    `          image: ${image || 'busybox:1.36'}`,
    '          command:',
    '            - /bin/sh',
    '            - -c',
    '            - |',
  ];

  commands.forEach((command) => {
    lines.push(`              ${command}`);
  });

  return lines.join('\n');
}

function buildConfigMountBlocks(configMounts) {
  if (!Array.isArray(configMounts) || configMounts.length === 0) {
    return {
      volumeMountsBlock: '',
      volumesBlock: '',
    };
  }

  const mountLines = ['          volumeMounts:'];
  const volumeLines = ['      volumes:'];

  configMounts.forEach((mount, index) => {
    if (!mount.configMapName || !mount.mountPath) {
      throw new Error(
        `Each configMount must include both "configMapName" and "mountPath". Invalid entry at index ${index}.`
      );
    }

    const volumeName = mount.volumeName || `config-mount-${index + 1}`;

    mountLines.push(`            - name: ${volumeName}`);
    mountLines.push(`              mountPath: ${mount.mountPath}`);

    if (mount.subPath) {
      mountLines.push(`              subPath: ${mount.subPath}`);
    }

    if (typeof mount.readOnly === 'boolean') {
      mountLines.push(`              readOnly: ${mount.readOnly}`);
    }

    volumeLines.push(`        - name: ${volumeName}`);
    volumeLines.push('          configMap:');
    volumeLines.push(`            name: ${mount.configMapName}`);

    if (Array.isArray(mount.items) && mount.items.length > 0) {
      volumeLines.push('            items:');
      mount.items.forEach((item) => {
        if (item.key && item.path) {
          volumeLines.push(`              - key: ${item.key}`);
          volumeLines.push(`                path: ${item.path}`);
        }
      });
    }
  });

  return {
    volumeMountsBlock: mountLines.join('\n'),
    volumesBlock: volumeLines.join('\n'),
  };
}

function resolveDeploymentValues(general, deployment, index, migrationConfig) {
  const requestsDefaults = (general.resources && general.resources.requests) || {};
  const limitsDefaults = (general.resources && general.resources.limits) || {};
  const migrationGeneral = (migrationConfig && migrationConfig.general) || {};
  const migrationRunners = (migrationConfig && migrationConfig.runners) || [];
  const migrationRunnerConfig =
    migrationRunners.find((runner) => runner.deploymentName === deployment.name) || {};

  const requests = {
    cpu: (deployment.resources && deployment.resources.requests && deployment.resources.requests.cpu) || requestsDefaults.cpu,
    memory:
      (deployment.resources && deployment.resources.requests && deployment.resources.requests.memory) ||
      requestsDefaults.memory,
  };

  const limits = {
    cpu: (deployment.resources && deployment.resources.limits && deployment.resources.limits.cpu) || limitsDefaults.cpu,
    memory:
      (deployment.resources && deployment.resources.limits && deployment.resources.limits.memory) || limitsDefaults.memory,
  };

  const namespace = deployment.namespace || general.namespace || 'default';
  const replicas = deployment.replicas || 1;
  const imageOverride = process.env.IMAGE_REF;
  const mysqlConfig = appConfig.mysql || {};
  const migrationCommand =
    migrationRunnerConfig.command || migrationGeneral.command || 'node run-mysql-migrations.js';
  const imagePullPolicy =
    migrationRunnerConfig.imagePullPolicy || migrationGeneral.imagePullPolicy || 'IfNotPresent';

  const missingFields = [];
  if (!deployment.name) missingFields.push('name');
  if (!deployment.image && !imageOverride) missingFields.push('image (or IMAGE_REF env)');
  if (!deployment.containerPort) missingFields.push('containerPort');

  if (missingFields.length > 0) {
    throw new Error(
      `Deployment at index ${index} is missing required field(s): ${missingFields.join(', ')}.`
    );
  }

  if (!requests.cpu || !requests.memory || !limits.cpu || !limits.memory) {
    throw new Error(
      `Missing CPU or memory values for deployment "${deployment.name}". Set defaults in "general.resources" or per deployment "resources".`
    );
  }

  const service = deployment.service || {};
  const { volumeMountsBlock, volumesBlock } = buildConfigMountBlocks(deployment.configMounts);
  const preStartCommands = deployment.preStartCommands || general.preStartCommands;
  const preStartImage = deployment.preStartImage || general.preStartImage || 'busybox:1.36';
  const initContainersBlock = buildInitContainersBlock(preStartCommands, preStartImage);

  return {
    name: deployment.name,
    namespace,
    replicas,
    image: imageOverride || deployment.image,
    containerPort: deployment.containerPort,
    requestsCpu: requests.cpu,
    requestsMemory: requests.memory,
    limitsCpu: limits.cpu,
    limitsMemory: limits.memory,
    serviceType: service.type || 'ClusterIP',
    servicePort: service.port || deployment.containerPort,
    serviceTargetPort: service.targetPort || deployment.containerPort,
    initContainersBlock,
    volumeMountsBlock,
    volumesBlock,
    migrationRunnerName: `${deployment.name}-mysql-migrations-runner`,
    migrationCommand,
    migrationImagePullPolicy: imagePullPolicy,
    mysqlHost: mysqlConfig.host || 'localhost',
    mysqlPort: mysqlConfig.port || 3306,
    mysqlUser: mysqlConfig.user || 'admin',
    mysqlPassword: mysqlConfig.password || 'supersecretpassword',
    mysqlDatabase: mysqlConfig.database || 'portfolio',
  };
}

function resolveMigrationRunnerValues(general, migrationGeneral, runner, deploymentMap) {
  const mysqlConfig = appConfig.mysql || {};
  const imageOverride = process.env.IMAGE_REF;
  const linkedDeployment = runner.deploymentName ? deploymentMap.get(runner.deploymentName) : null;
  const image =
    imageOverride ||
    runner.image ||
    migrationGeneral.image ||
    (linkedDeployment && linkedDeployment.image);

  if (!image) {
    throw new Error(
      `Migration runner "${runner.name || runner.deploymentName || 'unknown'}" is missing an image. Set "image" in migration-services.json.`
    );
  }

  const namespace =
    runner.namespace ||
    migrationGeneral.namespace ||
    (linkedDeployment && linkedDeployment.namespace) ||
    general.namespace ||
    'default';

  const runnerName =
    runner.name ||
    (runner.deploymentName ? `${runner.deploymentName}-mysql-migrations-runner` : null);

  if (!runnerName) {
    throw new Error('Each migration runner must include either "name" or "deploymentName".');
  }

  return {
    migrationRunnerName: runnerName,
    namespace,
    image,
    migrationCommand: runner.command || migrationGeneral.command || 'node run-mysql-migrations.js',
    migrationImagePullPolicy: runner.imagePullPolicy || migrationGeneral.imagePullPolicy || 'IfNotPresent',
    mysqlHost: mysqlConfig.host || 'localhost',
    mysqlPort: mysqlConfig.port || 3306,
    mysqlUser: mysqlConfig.user || 'admin',
    mysqlPassword: mysqlConfig.password || 'supersecretpassword',
    mysqlDatabase: mysqlConfig.database || 'portfolio',
  };
}

function generateFiles() {
  const config = loadConfig(configPath);
  const migrationConfig = loadOptionalConfig(migrationConfigPath);
  const general = config.general || {};
  const deployments = Array.isArray(config.deployments) ? config.deployments : [];
  const migrationGeneral = migrationConfig.general || {};
  const migrationRunners = Array.isArray(migrationConfig.runners) ? migrationConfig.runners : [];

  if (!Array.isArray(config.deployments)) {
    throw new Error('services.json must contain a "deployments" array (can be empty).');
  }

  const deploymentTemplate = loadTemplate('deployment.yaml.tpl');
  const serviceTemplate = loadTemplate('service.yaml.tpl');
  const migrationRunnerTemplate = loadTemplate('mysql-migration-runner.yaml.tpl');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (!fs.existsSync(deploymentsOutputDir)) {
    fs.mkdirSync(deploymentsOutputDir, { recursive: true });
  }

  if (!fs.existsSync(networkingOutputDir)) {
    fs.mkdirSync(networkingOutputDir, { recursive: true });
  }

  if (!fs.existsSync(migrationsOutputDir)) {
    fs.mkdirSync(migrationsOutputDir, { recursive: true });
  }

  clearOutputDirectory(deploymentsOutputDir);
  clearOutputDirectory(networkingOutputDir);
  clearOutputDirectory(migrationsOutputDir);

  const deploymentMap = new Map(deployments.map((deployment) => [deployment.name, deployment]));

  deployments.forEach((deployment, index) => {
    const values = resolveDeploymentValues(general, deployment, index, migrationConfig);

    const deploymentYamlPath = path.join(deploymentsOutputDir, `${deployment.name}-deployment.yaml`);
    const serviceYamlPath = path.join(networkingOutputDir, `${deployment.name}-service.yaml`);

    const deploymentYaml = applyTemplate(deploymentTemplate, values);
    const serviceYaml = applyTemplate(serviceTemplate, values);

    fs.writeFileSync(deploymentYamlPath, deploymentYaml, 'utf-8');
    fs.writeFileSync(serviceYamlPath, serviceYaml, 'utf-8');

    console.log(`Generated: ${deploymentYamlPath}`);
    console.log(`Generated: ${serviceYamlPath}`);
  });

  if (deployments.length === 0) {
    console.log('No deployments found. Skipped deployment/service YAML generation.');
  }

  const runnersToGenerate =
    migrationRunners.length > 0
      ? migrationRunners
      : deployments.map((deployment) => ({
          deploymentName: deployment.name,
          image: deployment.image,
        }));

  runnersToGenerate.forEach((runner) => {
    const values = resolveMigrationRunnerValues(general, migrationGeneral, runner, deploymentMap);
    const migrationRunnerYamlPath = path.join(
      migrationsOutputDir,
      `${values.migrationRunnerName}.yaml`
    );
    const migrationRunnerYaml = applyTemplate(migrationRunnerTemplate, values);

    fs.writeFileSync(migrationRunnerYamlPath, migrationRunnerYaml, 'utf-8');
    console.log(`Generated: ${migrationRunnerYamlPath}`);
  });
}

generateFiles();
