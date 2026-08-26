import { defineGkdSubscription } from '@gkd-kit/define';
import { batchImportApps } from '@gkd-kit/tools';
import categories from './categories';
import globalGroups from './globalGroups';

export default defineGkdSubscription({
  id: 233300,
  name: 'PingWangWang 的 GKD 订阅 🚀',
  version: 1,
  author: 'PingWangWang',
  checkUpdateUrl: './gkd.version.json5',
  supportUri: 'https://gkd.li/',
  categories,
  globalGroups,
  apps: await batchImportApps(`${import.meta.dirname}/apps`),
});
