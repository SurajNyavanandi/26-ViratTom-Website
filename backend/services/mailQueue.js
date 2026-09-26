const { EventEmitter } = require('events');

/**
 * Resilient Asynchronous Background Mail Queue
 * 
 * Offloads all email dispatch from the main Express HTTP event loop.
 * Features:
 * - Non-blocking enqueue (< 1ms execution time)
 * - Concurrency control (prevents socket exhaustion / libuv starvation)
 * - Automatic retry with exponential backoff
 * - In-memory fail-safe with zero external dependencies (Redis-free)
 */
class MailQueue extends EventEmitter {
  constructor(concurrency = 2) {
    super();
    this.concurrency = concurrency;
    this.activeWorkers = 0;
    this.queue = [];
    this.stats = {
      enqueued: 0,
      processed: 0,
      failed: 0,
      retried: 0,
    };
  }

  /**
   * Enqueue a mail dispatch job. Returns immediately without waiting on network I/O.
   * @param {Object} jobData
   * @param {Function} jobData.task - Async function returning a promise
   * @param {string} jobData.type - Label (e.g. 'OTP', 'Lead Confirmation')
   * @param {string} jobData.to - Recipient email
   * @param {number} jobData.maxRetries - Maximum retry attempts (default 2)
   */
  add(task, { type = 'Email', to = '', maxRetries = 2 } = {}) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      task,
      type,
      to,
      attempts: 0,
      maxRetries,
      enqueuedAt: Date.now(),
    };

    this.stats.enqueued++;
    this.queue.push(job);

    // Schedule queue tick on the next event loop turn (setImmediate)
    setImmediate(() => this._tick());

    return job.id;
  }

  /**
   * Internal queue processor loop
   */
  async _tick() {
    if (this.activeWorkers >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;

    try {
      job.attempts++;
      const startTime = Date.now();
      const result = await job.task();
      const elapsed = Date.now() - startTime;

      this.stats.processed++;
      this.emit('completed', { job, result, elapsed });
    } catch (err) {
      if (job.attempts <= job.maxRetries) {
        this.stats.retried++;
        const backoffMs = Math.min(1000 * Math.pow(2, job.attempts), 10000);
        console.warn(`[Mail Queue] Job ${job.id} (${job.type} to ${job.to}) failed (attempt ${job.attempts}). Retrying in ${backoffMs}ms... Error: ${err.message}`);
        
        setTimeout(() => {
          this.queue.unshift(job);
          this._tick();
        }, backoffMs);
      } else {
        this.stats.failed++;
        console.error(`[Mail Queue] Job ${job.id} (${job.type} to ${job.to}) permanently failed after ${job.attempts} attempts: ${err.message}`);
        this.emit('failed', { job, error: err });
      }
    } finally {
      this.activeWorkers--;
      // Process next job if pending
      if (this.queue.length > 0) {
        setImmediate(() => this._tick());
      }
    }
  }

  /**
   * Get current queue diagnostic metrics
   */
  getMetrics() {
    return {
      pending: this.queue.length,
      active: this.activeWorkers,
      concurrency: this.concurrency,
      ...this.stats,
    };
  }
}

// Global singleton mail queue instance with concurrency 2
const mailQueue = new MailQueue(2);

module.exports = mailQueue;
