import { Observable, map, from, mergeMap } from 'rxjs'
import Work from '@/static/script/work.js'
import servers from '@/static/config/common/server.config'

const getProcesseds = (page, size, job, all) => {
  return from(Work.record(page, size, job, all)).pipe(
    map((res) => res.data.data),
    map((data) => ({
      total: data.total,
      processeds: data.datas.map((item) => {
        let operation = Number(item.workflow_id).toString() === 'NaN' ? item.workflow_id : item.job
        if (operation === 'animegan_toon') {
          operation = 'cartoonize'
        }

        let busyJobs = 0
        if (item.status === 'busy' && item.content) {
          busyJobs = parseInt(JSON.parse(item.content).data)
        }
        let processStatus = item.status
        if (item.success) {
          processStatus = 'success'
        } else if (item.finish && !item.success) {
          processStatus = 'fail'
        }
        const { ojson } = item
        let ojsonObj, customWidth, customHeight
        if (ojson) {
          ojsonObj = JSON.parse(ojson)
          ojsonObj.config.forEach((configItem) => {
            const { module_params } = configItem.config
            const { width, height, customize } = module_params
            if (customize) {
              customWidth = width
              customHeight = height
            }
          })
        }

        //兼容老工作台的数据
        let thumbnail = servers.cdnBucketPath + item.thumbnail
        if (item.thumbnail.indexOf('public_src/thumbnail/') > -1) {
          thumbnail = servers.cloudS3BucketPath + item.thumbnail
        }
        return {
          thumbnail,
          originImg: item.targetSrc,
          filename: item.name,
          job_timelines: item.job_timelines,
          operation,
          customHeight,
          customWidth,
          transId: item.trans_id,
          workflowId: item.workflow_id,
          workflow: '',
          uid: item.uid,
          status: item.success == 0 ? Work.statusProcessFailed : Work.statusFinished,
          processStatus,
          busyJobs,
          process_time: item.process_time,
          likes: item.thumbsup,
          w: item.w,
          h: item.h,
          filesize: item.dst_file_size,
          config: {
            scale: item.scale,
          },
          selected: false,
          finish: item.finish,
        }
      }),
    }))
  )

  // return {
  //   thumbnail: servers.service + item.thumbnail,
  //   filename: item.name,
  //   operation: Number(item.workflow_id).toString() === 'NaN' ? item.workflow_id : item.job,
  //   transId: item.trans_id,
  //   workflowId: item.workflow_id,
  //   workflow: '',
  //   uid: item.uid,
  //   status: item.success == 0 ? Work.statusProcessFailed : Work.statusFinished,
  //   likes: item.thumbsup,
  //   w: item.w,
  //   h: item.h,
  //   filesize: item.dst_file_size,
  //   config: {
  //     scale: item.scale,
  //   },
  //   selected: false,
  //   finish: item.finish,
  // }
}

const getProcessedsV2 = (page, size, job, all) => {
  return from(Work.recordV2(page, size, job, all)).pipe(
    map((res) => res.data.data),
    map((data) => ({
      total: data.total,
      processeds: data.datas.map((item) => {
        let operation = Number(item.workflow_id).toString() === 'NaN' ? item.workflow_id : item.job
        if (operation === 'animegan_toon') {
          operation = 'cartoonize'
        }

        let busyJobs = 0
        if (item.status === 'busy' && item.content) {
          busyJobs = parseInt(JSON.parse(item.content).data)
        }
        let processStatus = item.status
        if (item.success) {
          processStatus = 'success'
        } else if (item.finish && !item.success) {
          processStatus = 'fail'
        }
        const { ojson } = item
        let ojsonObj, customWidth, customHeight
        if (ojson) {
          ojsonObj = JSON.parse(ojson)
          ojsonObj.config.forEach((configItem) => {
            const { module_params } = configItem.config
            const { width, height, customize } = module_params
            if (customize) {
              customWidth = width
              customHeight = height
            }
          })
        }

        return {
          thumbnail: servers.cloudS3BucketPath + item.thumbnail,
          originImg: item.targetSrc,
          filename: item.name,
          job_timelines: item.job_timelines,
          operation,
          customHeight,
          customWidth,
          transId: item.trans_id,
          workflowId: item.workflow_id,
          workflow: '',
          uid: item.uid,
          status: item.success == 0 ? Work.statusProcessFailed : Work.statusFinished,
          processStatus,
          busyJobs,
          process_time: item.process_time,
          likes: item.thumbsup,
          w: item.w,
          h: item.h,
          filesize: item.dst_file_size,
          config: {
            scale: item.scale,
          },
          selected: false,
          finish: item.finish,
        }
      }),
    }))
  )
}

export default {
  getProcesseds,
  getProcessedsV2,
}
