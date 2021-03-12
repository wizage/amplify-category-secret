const inquirer = require('inquirer');
const { sample } = require('../../sample-questions.json');

module.exports = {
  serviceQuestions,
};

async function serviceQuestions(context, options, resourceName) {
  const { amplify } = context;
  const projectMeta = context.amplify.getProjectMeta();
  const props: any = {};
  let nameDict: any = {};

  const nameProject = [
    {
      type: sample.projectName.type,
      name: sample.projectName.key,
      message: sample.projectName.question,
      validate: amplify.inputValidation(sample.projectName),
      default: sample.projectName.default,
    },
  ];

  if (resourceName) {
    nameDict.resourceName = resourceName;
    props.shared = nameDict;
  } else {
    nameDict = await inquirer.prompt(nameProject);
    props.shared = nameDict;
  }
  return props;
}