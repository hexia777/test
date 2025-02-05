import axios from '@/static/script/request/axios'
import servers from '@/static/config/common/server.config'

export const getS3UploadUrl = (data) => {
  return axios({
    url: servers.service + '/api/s3/presignurl/upload',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

export const getS3UploadUrlV2 = (data) => {
  return axios({
    url: servers.service + '/api/v3/presignurl/upload',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

export const getAttachUploadUrl = (data) => {
  return axios({
    url: servers.service + '/api/s3/presignurl/upload/ticket',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

export const getS3PreviewUrl = (data) => {
  return axios({
    url: servers.service + '/api/s3/presignurl/preview',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

export const getS3PreviewUrlV2 = (data) => {
  return axios({
    url: servers.service + '/api/v3/presignurl/preview',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

export const getS3DownloadUrl = (data) => {
  return axios({
    url: servers.service + '/api/s3/presignurl/download',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

export const getS3DownloadUrlV2 = (data) => {
  return axios({
    url: servers.service + '/api/v3/presignurl/download',
    method: 'POST',
    data,
  }).then((res) => {
    return res.data
  })
}

export const directUploadS3 = (url, file) => {
  return axios({
    method: 'PUT',
    data: file,
    url: url,
  }).then((res) => {
    return res.data
  })
}
