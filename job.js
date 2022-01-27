const CronJob = require('cron').CronJob;

module.exports = (cronTemplate, func) => {
    const job = new CronJob(cronTemplate, func);

    job.start();
}