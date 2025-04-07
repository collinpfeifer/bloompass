import { Logging } from '@google-cloud/logging';

const logging = new Logging({
  projectId: 'adfluent',
});

const log = logging.log('my-log');

const metadata = {
  resource: {
    type: 'global',
    labels: { env: 'test', name: 'my-log' },
  },
};

export { log, metadata };
