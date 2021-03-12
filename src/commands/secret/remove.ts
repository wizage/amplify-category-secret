import { category } from '../../constants';
const subcommand = 'remove';

module.exports = {
  name: subcommand,
  run: async (context) => {
    //Do what you want
    await context.amplify.removeResource(context, category);
  },
};