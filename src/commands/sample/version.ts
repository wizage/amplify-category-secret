const fs = require('fs');
const projectMeta = JSON.parse(fs.readFileSync(`${__dirname}/../../../package.json`));
const subcommand = 'version';

module.exports = {
  name: subcommand,
  run: async (context) => {
    context.print.info(`${projectMeta.name}@${projectMeta.version}`);
  },
};