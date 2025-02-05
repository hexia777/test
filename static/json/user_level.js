const mb = 1024 * 1024
const five_mb = 5 * 1024 * 1024
const ten_mb = 10 * 1024 * 1024
const fifty_mb = 50 * 1024 * 1024

export default {
  mb,
  guest: 'guest',
  free: 'free',
  register: 'register',
  basic: 'basic',
  pro: 'pro',
  paying: 'paying',
  expired: 'expired',
  limits: {
    free: {
      filesize: five_mb,
      resolution: {
        width: 2000,
        height: 2000,
        megapixels: 2800000,
      },
      widthAndHeightLenLimit: 4000,
      batch: 1,
      credits: 3,
      compress: {
        filesize: five_mb,
        limitUpload: null,
        credits: 5,
      },
    },
    guest: {
      filesize: five_mb,
      resolution: {
        width: 2000,
        height: 2000,
        megapixels: 2800000,
      },
      batch: 1,
      credits: 3,
      compress: {
        filesize: five_mb,
        limitUpload: null,
        credits: 5,
      },
    },
    register: {
      filesize: five_mb,
      resolution: {
        width: 2000,
        height: 2000,
        megapixels: 2800000,
      },
      batch: 1,
      credits: 3,
      compress: {
        filesize: five_mb,
        limitUpload: null,
        credits: 100,
      },
    },
    basic: {
      filesize: ten_mb,
      resolution: {
        width: 3000,
        height: 3000,
        megapixels: 34000000,
      },
      batch: 5,
      credits: 200,
      compress: {
        filesize: fifty_mb,
        limitUpload: null,
        credits: null,
      },
    },
    pro: {
      filesize: ten_mb,
      resolution: {
        width: 3000,
        height: 3000,
        megapixels: 34000000,
      },
      batch: 10,
      credits: 500,
      compress: {
        filesize: fifty_mb,
        limitUpload: null,
        credits: null,
      },
    },
    paying: {
      filesize: ten_mb,
      resolution: {
        width: 3000,
        height: 3000,
        megapixels: 34000000,
      },
      widthAndHeightLenLimit: 8000,
      batch: 10,
      credits: 500,
      compress: {
        filesize: fifty_mb,
        limitUpload: null,
        credits: null,
      },
    },
    expired: {
      filesize: five_mb,
      resolution: {
        width: 2000,
        height: 2000,
        megapixels: 2800000,
      },
      batch: 1,
      credits: 3,
      compress: {
        filesize: five_mb,
        limitUpload: null,
        credits: 100,
      },
    },
  },
}
