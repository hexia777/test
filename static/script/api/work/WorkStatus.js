const statusResizing = 'resizing'
const statusCompressing = 'compressing'
const statusUploading = 'uploading'
const statusReady = 'ready'
const statusWaiting = 'waiting'
const statusProcessing = 'processing'
const statusFinished = 'finished'
const statusImageTooLarge = 'imageTooLarge'
const statusUploadFailed = 'uploadFailed'
const statusProcessFailed = 'processFailed'
const workStatusDict = {
  statusResizing,
  statusCompressing,
  statusUploading,
  statusReady,
  statusWaiting,
  statusProcessing,
  statusFinished,
  statusImageTooLarge,
  statusUploadFailed,
  statusProcessFailed,
}

const workStatuses = [
  statusResizing,
  statusCompressing,
  statusUploading,
  statusReady,
  statusWaiting,
  statusProcessing,
  statusFinished,
  statusImageTooLarge,
  statusUploadFailed,
  statusProcessFailed,
]
export default {
  workStatuses,
  ...workStatusDict,
}
