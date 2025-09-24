function startReminderScheduler(options) {
  const {
    reminderService,
    lookAheadDays,
    intervalMinutes,
    channels,
    logger = console,
  } = options;

  const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;
  async function runOnce() {
    try {
      const result = await reminderService.dispatchReminders({
        withinDays: lookAheadDays,
        channels,
      });
      logger.info('[ReminderScheduler] Dispatch complete', result);
    } catch (error) {
      logger.error('[ReminderScheduler] Dispatch failed', error);
    }
  }

  const timer = setInterval(runOnce, intervalMs);
  runOnce();

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

module.exports = {
  startReminderScheduler,
};
