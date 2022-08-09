# 获取本地摄像头列表

```
getCameraList(): Promise<MediaStream []>
```

### 实例

```
this.mediaSettingServer.getCameraList();

// 返回数据
[{
  deviceId: '3fba3e09a6b2106a58472b67f3b9ce77fe0b9526dfc1911029c333f8edec11d8',
  kind: 'videoinput',
  label: 'FaceTime HD Camera',
  groupId: '11704effc5c97bb03c17096ae80b03c4b2013f70d9c56bff0df0d067dc3ff41b'
}]
```

# 销毁本地预览流

```
destroyStream() : Boolean
```

### 实例

```
this.mediaSettingServer.destroyStream();
```

# 创建本地视频流预览实例

```
createALocalPreviewInstance(options): void
```

### 参数

| 属性        | 可取值                                 |
| ----------- | -------------------------------------- |
| videoNode   | 本地渲染的节点 ID                      |
| audio       | 是否获取音频                           |
| video       | 当前选择的摄像头或图片等[设备 ID]      |
| profile     | VhallRTC.RTC_VIDEO_PROFILE_240P_16x9_M |
| mute        | { audio: false, video: false }         |
| videoDevice | 选中的设备 ID                          |

### 实例

```
const options = {
    videoNode: 'vmp-media-setting-preview-video',
    audio: this.mediaState.audioInput === '' ? false : true,
    video: this.mediaState.video === '' ? false : true,
    profile: VhallRTC.RTC_VIDEO_PROFILE_480P_16X9_M,
    mute: { audio: false, video: false },
    videoDevice: this.mediaState.video
  };

this.mediaSettingServer.createALocalPreviewInstance(options);
```

# 修改本地采集源

```
modifyVideoType(): void
```

### 实例

```
// 值的范围 camera，picture
this.mediaSettingServer.modifyVideoType('picture');

// 建议：修改采集源需要销毁本地摄像头实例，下面为联合使用。
this.mediaSettingServer.modifyVideoType('picture');
this.mediaSettingServer.destroyStream();


```

# 本地图片上传

```
imageUpload(event:DOM,options:Object): Promise<Object>
```

### 参数

| 属性               | 可取值                    |
| ------------------ | ------------------------- |
| token              | 设置 Header 头信息        |
| platform           | 设置 Header 头信息 默认 7 |
| imageUploadAddress | 图片上传地址              |
| path               | 图片存放的目录            |
| interact_token     | ……                        |

### 实例

```

const { watchInitData } = useRoomBaseServer().state;
      this.roomId = watchInitData?.interact?.room_id;
      this.interactToken = watchInitData?.interact?.interact_token;
      this.headToken = localStorage.getItem('token');

this.baseUrl = "https://t-saas-dispatch.vhall.com"
async ……
const { data } = await useMediaSettingServer().imageUpload(event, {
  token:this.headToken,
  platform: 7,
  imageUploadAddress: `${this.baseUrl}/v3/commons/upload/index`,
  path: `${this.roomId}/img`,
  interact_token: this.interactToken
});

//
console.log(data, 9900);


```
