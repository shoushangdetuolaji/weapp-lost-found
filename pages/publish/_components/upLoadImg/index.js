// pages/publish/_components/upLoadImg/index.js
/**
 * <up-pic url="https://j.dns06.net.cn/index.php?m=Api&c=index&a=uploadDownwindxxx" count="3" autoup class='up-pic'></up-pic>
 * 
 * url：上传图片地址
 * count:上传总数量(默认上传1张图片)
 * autoup:是否自动上传(无需传参数,参考以上)
 * 
 * 2019-01-08 MIT
 */
const regeneratorRuntime = require('../../../../utils/regenerate.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url:{
      type: String,
      observer(newVal,oldVal){
        this.data.url = newVal;
      }
    },
    count: {
      type: Number,
      observer(newVal, oldVal) {
        this.data.count = newVal;
      }
    },
    autoup: {
      type: Boolean,
      observer(newVal, oldVal) {
        this.data.auto_upload = newVal;
        this.setData({
          auto_upload: this.data.auto_upload
        })
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgs:[],
    upload_picture_list:[],
    count:1,
    url:'',
    auto_upload:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chooseImage() {
      cImage(this, parseInt(this.data.count), this.data.url);
    },
    uploadimage() {
      uImage(this, this.data.url);
    },
    deleteImg(e) {
      dImage(e, this);
    },
    previewImg(e) {
      pImage(e, this);
    }
  }
})


// 上传文件
const upload_file_server = async (url, that, upload_picture_list, j) => {
  const upload_task = await wx.uploadFile({
    url,
    filePath: upload_picture_list[j]['path'],
    name: 'file',
    formData: {
      'num': j
    },
    async success(res) {
      let data = await JSON.parse(res.data);
      let filename = data.info
      upload_picture_list[j]['path_server'] = filename
      await that.setData({
        upload_picture_list: upload_picture_list
      });
    }
  })
  upload_task.onProgressUpdate((res) => {
    upload_picture_list[j]['upload_percent'] = res.progress
    that.setData({
      upload_picture_list: upload_picture_list
    });
  });
}


// 上传图片(this,api.imageup)
const uImage = (_that, url) => {
  for (let j in _that.data.upload_picture_list) {
    if (_that.data.upload_picture_list[j]['upload_percent'] == 0) {
      upload_file_server(url, _that, _that.data.upload_picture_list, j)
    }
  }
}


// 删除图片
const dImage = (e, _that) => {
  _that.data.upload_picture_list.splice(e.currentTarget.dataset.index, 1);
  _that.data.imgs.splice(e.currentTarget.dataset.index, 1);
  console.log(_that.data.imgs)
  _that.setData({
    upload_picture_list: _that.data.upload_picture_list
  });
}


// 选择图片
const cImage = (_that, count, url) => {
  console.log(_that, count, url)
  wx.chooseImage({
    count,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: function (res) {
      _that.data.imgs = _that.data.imgs.concat(res.tempFilePaths)
      for (let i in res.tempFiles) {
        res.tempFiles[i]['upload_percent'] = 0
        res.tempFiles[i]['path_server'] = ''
        _that.data.upload_picture_list.push(res.tempFiles[i])
      }
      if (_that.data.auto_upload) {
        count == _that.data.upload_picture_list.length ? uImage(_that, url) : console.log('图片不够!')
      }
      _that.setData({
        upload_picture_list: _that.data.upload_picture_list,
      });
    }
  })
}

// 预览图片
const pImage = (e, _that) => {
  wx.previewImage({
    current: _that.data.imgs[e.currentTarget.dataset.index],
    urls: _that.data.imgs
  })
}
