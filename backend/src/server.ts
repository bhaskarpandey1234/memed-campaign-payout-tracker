import app from './app';
import { connectDatabase } from './config/database';
import { config } from './config/env';
import { Campaign } from './modules/campaigns';

export async function start() {
  await connectDatabase();
  await Campaign.updateMany(
    { normalizedName: { $exists: false } },
    [{ $set: { normalizedName: { $toLower: { $trim: { input: '$name' } } } } }],
  );
  await Campaign.syncIndexes();
  return app.listen(config.port, () => console.log(`API listening on ${config.port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default app;
