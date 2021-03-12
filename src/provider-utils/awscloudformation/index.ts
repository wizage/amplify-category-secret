const fs = require('fs');
import { category } from '../../constants';

let serviceMetadata;

export async function addResource(context, service, options) {
    serviceMetadata = context.amplify.readJsonFile(`${__dirname}/../supported-services.json`)[service];
    const targetDir = context.amplify.pathManager.getBackendDirPath();
    const { serviceWalkthroughFilename } = serviceMetadata;
    const serviceWalkthroughSrc = `${__dirname}/service-walkthroughs/${serviceWalkthroughFilename}`;
    const { serviceQuestions } = require(serviceWalkthroughSrc);
    const result = await serviceQuestions(context, options);
    context.amplify.updateamplifyMetaAfterResourceAdd(
      category,
      result.shared.resourceName,
      options,
    );
    
    if (!fs.existsSync(`${targetDir}/${category}/${result.shared.resourceName}/`)) {
      fs.mkdirSync(`${targetDir}/${category}/${result.shared.resourceName}/`, { recursive: true });
    }
    if (result.parameters !== undefined) {
      await fs.writeFileSync(`${targetDir}/${category}/${result.shared.resourceName}/parameters.json`, JSON.stringify(result.parameters, null, 4));
    }
    await fs.writeFileSync(`${targetDir}/${category}/${result.shared.resourceName}/props.json`, JSON.stringify(result, null, 4));
    /*
    Copy and build cloudformation with answers if needed
    await buildTemplates(context, result);
    */
}


export async function updateResource(context, service, options, resourceName) {
    serviceMetadata = context.amplify.readJsonFile(`${__dirname}/../supported-services.json`)[service];
    const targetDir = context.amplify.pathManager.getBackendDirPath();
    const { serviceWalkthroughFilename } = serviceMetadata;
    const serviceWalkthroughSrc = `${__dirname}/service-walkthroughs/${serviceWalkthroughFilename}`;
    const { serviceQuestions } = require(serviceWalkthroughSrc);
    const result = await serviceQuestions(context, options, resourceName);
    if (result.parameters !== undefined) {
      await fs.writeFileSync(`${targetDir}/${category}/${result.shared.resourceName}/parameters.json`, JSON.stringify(result.parameters, null, 4));
    }
    await fs.writeFileSync(`${targetDir}/${category}/${result.shared.resourceName}/props.json`, JSON.stringify(result, null, 4));
    /*
    Copy and build cloudformation with answers if needed
    await buildTemplates(context, result);
    */
    context.print.success(`Successfully updated ${result.shared.resourceName}`);
  }