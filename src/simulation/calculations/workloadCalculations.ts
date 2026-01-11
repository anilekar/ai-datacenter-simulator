import { Scheduler, JobState } from '../../types/workload'

export function countJobsByState(scheduler: Scheduler, state: JobState): number {
  let count = 0
  scheduler.queues.forEach(queue => {
    queue.jobs.forEach(job => {
      if (job.state === state) count++
    })
  })
  return count
}

export function calculateAverageQueueTime(scheduler: Scheduler): number {
  let totalQueueTime = 0
  let completedJobs = 0

  scheduler.queues.forEach(queue => {
    queue.jobs.forEach(job => {
      if (job.state === JobState.COMPLETED && job.start_time) {
        const queueTimeMs = job.start_time.getTime() - job.submit_time.getTime()
        totalQueueTime += queueTimeMs / (1000 * 60 * 60) // Convert to hours
        completedJobs++
      }
    })
  })

  return completedJobs > 0 ? totalQueueTime / completedJobs : 0
}

export function calculateTotalGPUHours(scheduler: Scheduler): number {
  let totalGPUHours = 0

  scheduler.queues.forEach(queue => {
    queue.jobs.forEach(job => {
      if (job.state === JobState.RUNNING && job.start_time) {
        const runTimeMs = Date.now() - job.start_time.getTime()
        const runTimeHours = runTimeMs / (1000 * 60 * 60)
        totalGPUHours += job.gpu_count * runTimeHours
      } else if (job.state === JobState.COMPLETED && job.start_time && job.end_time) {
        const runTimeMs = job.end_time.getTime() - job.start_time.getTime()
        const runTimeHours = runTimeMs / (1000 * 60 * 60)
        totalGPUHours += job.gpu_count * runTimeHours
      }
    })
  })

  return totalGPUHours
}
