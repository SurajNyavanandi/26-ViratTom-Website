/**
 * In-System Event & Alert Dispatcher for ViratTom Platform
 */

async function dispatchAlert({ type, title, message, meta = {} }) {
  // Clean structured console audit trail
  console.log(`\n======================================================`);
  console.log(`[ALERT] [${type}] ${title}`);
  console.log(`Message: ${message}`);
  if (Object.keys(meta).length > 0) {
    console.log(`Meta:`, JSON.stringify(meta, null, 2));
  }
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  return true;
}

module.exports = {
  dispatchAlert,
};
