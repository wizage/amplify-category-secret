const inquirer = require('inquirer');
var fs = require('fs');
const { secret } = require('../../secret-questions.json');
const  { getAWSConfig }   = require('../utils/get-aws');

module.exports = {
  serviceQuestions,
};

async function serviceQuestions(context, options, resourceName) {
  const { amplify } = context;
  const projectMeta = context.amplify.getProjectMeta();
  const targetDir = amplify.pathManager.getBackendDirPath();
  const projectDetails = context.amplify.getProjectDetails();
  const props: any = {};
  let update = false;
  let nameDict: any = {};

  const nameProject = [
    {
      type: secret.projectName.type,
      name: secret.projectName.key,
      message: secret.projectName.question,
      validate: amplify.inputValidation(secret.projectName),
      default: secret.projectName.default,
    },
  ];

  if (resourceName) {
    console.log("hello?!");
    nameDict.resourceName = resourceName;
    update = true;
    try {
      const oldValues = JSON.parse(fs.readFileSync(`${targetDir}/secret/${resourceName}/props.json`));
      Object.assign(props, oldValues);
      console.log(props);
      console.log(oldValues);
    } catch (err) {
      // Do nothing
      console.log(err);
    }
  } else {
    nameDict = await inquirer.prompt(nameProject);
    props.shared = nameDict;
  }

  const secretLocation = [
    {
      type: secret.getSecretType.type,
      name: secret.getSecretType.key,
      message: secret.getSecretType.question,
      choices: secret.getSecretType.options,
      default: secret.getSecretType.default
    }
  ];

  const secretLocationAnswers = await inquirer.prompt(secretLocation);
  let secretVar = '';

  if (secretLocationAnswers.secretType === 'text') {
    const secretTextQuestion = [
      {
        type: secret.secretText.type,
        name: secret.secretText.key,
        message: secret.secretText.question,
      },
    ];
    const secretTextAnswer = await inquirer.prompt(secretTextQuestion);
    secretVar = secretTextAnswer.secret;
  } else {
    context.print.error('not yet suppported');
  }

  const provider = getAWSConfig(context, options);
  const aws = await provider.getConfiguredAWSClient(context);

  var secretsmanager = new aws.SecretsManager({apiVersion: '2017-10-17'});

  try {
    const params: any = {
      SecretString: secretVar,
      Description: 'This was created from the amplify cli'
    };
    let secret = {};
    if (update) {
      params.SecretId = props.secret.ARN;
      secret = await secretsmanager.updateSecret(params).promise();
    } else {
      params.Name = `${nameDict.resourceName}-${projectDetails.localEnvInfo.envName}`;
      secret = await secretsmanager.createSecret(params).promise();
    }
    props.secret = secret;
  } catch (e) {
    context.print.error(e);
  }


  return props;
}

