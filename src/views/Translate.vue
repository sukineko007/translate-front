<template>
  <div
    id="translateMainDiv"
    class="translate"
    v-loading="loadingTranslate"
    element-loading-text="正在翻译中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0,0,0,0.6)"
  >
    <div class="choose">
      <el-tabs
        v-model="activeName"
        @tab-click="handleClick"
        type="card"
        :before-leave="beforeChangeTab"
      >
        <el-tab-pane label="功能1" name="first">
          <span>功能1：</span>
          <div class="toTranslate">
            源语言：
            <el-select v-model="key" placeholder="请选择">
              <el-option
                v-for="item in languageData"
                :key="item.id"
                :label="item.value"
                :value="item.id"
              ></el-option> </el-select
            >目标语言：
            <el-select v-model="key2" placeholder="请选择">
              <el-option
                v-for="item in languageData"
                :key="item.id"
                :label="item.value"
                :value="item.id"
                :disabled="item.disabled"
              ></el-option>
            </el-select>
            <el-button type="primary" @click="translate" class="button">翻译</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="功能2" name="second">
          <span>功能2：</span>
          <div class="toBeResource">
            <el-input
              type="text"
              placeholder="BE字段编号"
              v-model="fieldID"
              style="width: 220px; margin-right: 10px"
            ></el-input>
            <el-input
              type="text"
              placeholder="BE字段名"
              v-model="fieldName"
              style="width: 220px; margin-right: 10px"
            ></el-input>
            <el-input
              type="number"
              placeholder="字段数"
              v-model="fieldNumber"
              style="width: 98px; margin-right: 10px"
            ></el-input>
            <el-input
              type="text"
              placeholder="BE节点编号(不输默认主节点)"
              v-model="beChildCode"
              style="width: 300px; margin-right: 10px"
            ></el-input>
            <el-button type="success" @click="toBeResource" class="button"
              >BE加字段</el-button
            >
          </div>
        </el-tab-pane>
        <el-tab-pane label="功能3" name="third">
          <span>功能3：</span>
          <div class="toExceptionResource">
            <el-input
              type="text"
              placeholder="资源文件key(自动补3位数字)"
              v-model="resourceID"
              style="width: 400px"
            ></el-input
            >&nbsp;
            <el-button type="primary" @click="toResource" class="button" plain
              >转资源文件格式</el-button
            >
            <el-button type="primary" @click="openDialog" class="button" plain
              >查看生成的Key</el-button
            >
          </div>
        </el-tab-pane>
        <el-tab-pane label="功能4" name="fouth">
          <p style="margin: 0">
            使用说明：点击上传选择要翻译的***.en.lres文件或者直接将文件拖到上传框,文件列表框出现选择的文件列表后，点击读取文件，提示读取完成后，选择目标语言，然后点开始翻译,
            翻译完成后可单独导出文件或一键导出全部，直接替换原来的***.en.lres文件即可。注：上传后不支持更换或者移除文件，如需更换或者移除请刷新浏览器
          </p>
        </el-tab-pane>
        <!--        <el-tab-pane label="功能5" name="fifth">
          <p style="margin: 0">填写各项，一键部署补丁</p>
        </el-tab-pane>
        <el-tab-pane label="功能6" name="sixth">
          <span style="margin: 0">留言</span>
        </el-tab-pane>
        <el-tab-pane label="功能7" name="seventh">
          <el-button type="primary" @click="openDialog2" class="button" plain>表情</el-button>
        </el-tab-pane> -->
      </el-tabs>
    </div>
    <div v-if="isNotFunc5">
      <div class="translateArea" v-if="inputSelf">
        <div class="input">
          <div class="inputArea">
            <el-input
              :autosize="{ minRows: 20, maxRows: 20 }"
              type="textarea"
              placeholder="输入提示：
            1、功能1：输入要翻译的文本（支持翻译字符串或者资源文件json数组；
            2、功能2：粘贴整个BE的内容
              （BE字段编号A、字段名B支持同时输入多个，之间以#分割,最后一个不加）
              输入字段个数n，点BE加字段，会在BE上添加n个字段编号为A，字段名为B的新字段
            3、功能3：要转资源文件格式的异常信息文本(每条异常信息之间以#分隔)；"
              v-model="inputText"
            ></el-input>
          </div>
        </div>
        <div class="result" v-if="showResult1 || showResult2 || showResult3">
          <div class="resultArea">
            <el-input
              v-if="showResult2"
              :autosize="{ minRows: 20, maxRows: 20 }"
              type="textarea"
              placeholder
              v-model="resultText"
              :readonly="true"
            ></el-input>
            <json-viewer
              v-if="showResult1"
              :value="resultJson"
              :expand-depth="5"
              copyable
              boxed
            ></json-viewer>
            <json-viewer
              v-if="showResult3"
              :value="formatJson"
              :expand-depth="5"
              copyable
              boxed
            ></json-viewer>
          </div>
        </div>
      </div>
      <div
        class="uploadFile"
        v-if="!inputSelf"
        v-loading="loading"
        :element-loading-text="loadtext"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0,0,0,0.8)"
      >
        <div class="header">
          <el-upload
            class="uploadBox"
            ref="upload"
            action="#"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :file-list="fileList"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="uploadFile"
            :on-change="changeFile"
            :auto-upload="false"
            drag
            accept=".lres"
            multiple
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或
              <em>点击上传</em>
              <div slot="tip" class="el-upload__tip">只能上传.en.lres文件</div>
            </div>
          </el-upload>
          <div class="fileList">
            <ul>
              文件列表(更换请刷新浏览器)
              <li v-for="item in chooseFileList" :key="item.name">{{ item.name }}</li>
            </ul>
          </div>
          <div class="choose2">
            原语言：
            <el-select v-model="key" placeholder="请选择" style="width: 160px">
              <el-option
                v-for="item in languageData"
                :key="item.id"
                :label="item.value"
                :value="item.id"
              ></el-option> </el-select
            >目标语言：
            <el-select v-model="key2" placeholder="请选择目标语言" style="width: 160px">
              <el-option
                v-for="item in languageData"
                :key="item.id"
                :label="item.value"
                :value="item.id"
                :disabled="item.disabled"
              ></el-option>
            </el-select>
            <el-button type="warning" @click="readFileText" class="button"
              >读取文件</el-button
            >
            <el-button type="primary" @click="translateFile" class="button"
              >开始翻译</el-button
            >
          </div>
        </div>
        <div class="uploadResult">
          <el-button
            type="success"
            @click="batchExportJson()"
            v-if="results2.length > 0"
            class="button3"
            >一键导出全部</el-button
          >
          <el-row>
            <el-col
              :span="12"
              class="el-row-col"
              v-for="item in results2"
              :key="item.name"
            >
              <el-button
                type="success"
                @click="exportJson(item.jsonStr, item.name)"
                class="button3"
                >导出文件</el-button
              >
              <h5>{{ item.name }}</h5>
              <json-viewer
                :value="item.jsonStr"
                :expand-depth="5"
                copyable
                boxed
                class="jsonviewr"
              ></json-viewer>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <el-dialog title :visible.sync="dialogVisible" width="40%">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>生成的资源文件KEY</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            v-clipboard:copy="copyData"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
            >{{ copyButton }}</el-button
          >
        </div>
        <span v-if="formatID.length === 0">转资源文件后才可以显示生成的Key</span>
        <div v-if="formatID.length > 0">
          <div class="showResourceKey">
            <el-input
              :autosize="{ minRows: 20, maxRows: 20 }"
              type="textarea"
              placeholder="输入提示：
            1、功能1：输入要翻译的文本（支持翻译字符串或者资源文件json数组；
            2、功能2：粘贴整个BE的内容
              （BE字段编号A、字段名B支持同时输入多个，之间以#分割,最后一个不加）
              输入字段个数n，点BE加字段，会在BE上添加n个字段编号为A，字段名为B的新字段
            3、功能3：要转资源文件格式的异常信息文本(每条异常信息之间以#分隔)；"
              v-model="copyData"
              :readonly="true"
            ></el-input>
          </div>
        </div>
      </el-card>
    </el-dialog>

    <el-dialog
      title="表情制作"
      :visible.sync="dialogVisible2"
      fullscreen
      :append-to-body="true"
    >
      <CopyData></CopyData>
    </el-dialog>
  </div>
</template>

<script>
import JsonViewer from "../../node_modules/vue-json-viewer";
import FileSaver from "file-saver";
import uuidv1 from "uuid/v1";
import Editor from "./Editor";
import CopyData from "./CopyData";
export default {
  components: {
    jsonViewer: JsonViewer,
    Editor,
    CopyData,
  },
  data() {
    return {
      winHeight: 800,
      loadingTranslate: false,
      isFunc7: false,
      dialogVisible2: false,
      copyData: "",
      copyButton: "",
      dialogVisible: false,
      typeKey: "linux",
      isNotFunc5: true,
      activeName: "first",
      fieldNumber: "",
      beChildCode: "",
      fieldID: "",
      fieldName: "",
      loadtext: "",
      loading: false,
      resourceID: "",
      formatID: [],
      formatJson: [], //转资源文件格式
      showResult1: false,
      showResult2: false,
      showResult3: false,
      languageData: [
        {
          id: "auto",
          value: "自动检测",
          disabled: true,
        },
        {
          id: "zh",
          value: "中文（简体）",
        },
        {
          id: "cht",
          value: "中文（繁体）",
        },
        {
          id: "en",
          value: "英语",
        },
        {
          id: "yue",
          value: "粤语",
        },
        {
          id: "wyw",
          value: "文言文",
        },
        {
          id: "jp",
          value: "日语",
        },
        {
          id: "kor",
          value: "韩语",
        },
        {
          id: "fra",
          value: "法语",
        },
        {
          id: "spa",
          value: "西班牙语",
        },
        {
          id: "th",
          value: "泰语",
        },
        {
          id: "ara",
          value: "阿拉伯语",
        },
        {
          id: "ru",
          value: "俄语",
        },
        {
          id: "pt",
          value: "葡萄牙语",
        },
        {
          id: "de",
          value: "德语",
        },
        {
          id: "it",
          value: "意大利语",
        },
        {
          id: "el",
          value: "希腊语",
        },
        {
          id: "nl",
          value: "荷兰语",
        },
        {
          id: "pl",
          value: "波兰语",
        },
        {
          id: "bul",
          value: "保加利亚语",
        },
        {
          id: "est",
          value: "爱沙尼亚语",
        },
        {
          id: "dan",
          value: "丹麦语",
        },
        {
          id: "fin",
          value: "芬兰语",
        },
        {
          id: "cs",
          value: "捷克语",
        },
        {
          id: "rom",
          value: "罗马尼亚语",
        },
        {
          id: "slo",
          value: "斯洛文尼亚语",
        },
        {
          id: "swe",
          value: "瑞典语",
        },
        {
          id: "hu",
          value: "匈牙利语",
        },
        {
          id: "vie",
          value: "越南语",
        },
      ],
      key: "auto",
      key2: "",
      inputText: "",
      resultText: "",
      inputJson: [],
      resultJson: [],
      inputItem: {
        Id: "",
        Value: "",
        Comment: "",
      },
      resultItem: {
        Id: "",
        Value: "",
        Comment: "",
      },
      appID: "20200427000431319",
      appKey: "lvDuIYmoNeRYuR_n2JXB",
      sign: "",
      q: "",
      from: "",
      to: "",
      salt: "",
      inputSelf: true,
      fileList: [],
      chooseFileList: [],
      chooseJson: [],
      results2: [],
      jsonObData: null,
      autoPatchForm: {
        ip: "10.24.21.1",
        typeKey: "linux",
        port: "22",
        username: "root",
        password: "Test1127?!",
        appPath: "FIShare/gscloud",
        updateNpm: "false",
        patchType: "0",
        patchFile: "",
      },
      formRules: {
        ip: [{ required: true, message: "请输入IP", trigger: "blur" }],
        systemType: [{ required: true, message: "请选择系统类型", trigger: "blur" }],
        port: [{ required: true, message: "请输入ssh端口", trigger: "blur" }],
        username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        appPath: [{ required: true, message: "请输入应用目录", trigger: "blur" }],
        updateNpm: [
          { required: true, message: "请选择是否需要更新Npm", trigger: "blur" },
        ],
        patchType: [{ required: true, message: "请选择是否补丁类型", trigger: "blur" }],
        patchFile: [{ required: true, message: "请", trigger: "blur" }],
      },
      systemType: [
        {
          id: "linux",
          value: "Linux",
        },
        {
          id: "windows",
          value: "Windows",
        },
      ],
      updateNpm: "false",
      needUpdateNpm: [
        {
          id: false,
          value: "否",
        },
      ],
      fileList2: [],
    };
  },
  methods: {
    goUpload() {
      this.inputSelf = !this.inputSelf;
    },
    translate() {
      this.showResult1 = false;
      this.showResult2 = false;
      this.showResult3 = false;
      console.log("开始翻译");
      if (!this.key) {
        this.$message.error("请选择原语言");
        return;
      }
      if (!this.key2) {
        this.$message.error("请选择目标语言");
        return;
      }
      if (!this.inputText) {
        this.$message.error("请输入待翻译文本");
        return;
      }
      //记录所选语言
      var inputLanguageObj = {
        originalLanguage: this.key,
        translateLanguage: this.key2,
      };
      var languageData = JSON.stringify(inputLanguageObj);
      localStorage.setItem("inputLanguage", languageData);
      var inputData = this.inputText;
      if (typeof inputData == "string") {
        var that = this;
        if (that.checkInput(inputData) == true) {
          this.inputJson = JSON.parse(inputData);
          console.log("JSON格式化输入数据：", this.inputJson);
          if (this.inputJson instanceof Array) {
            //资源文件翻译
            this.batchTranslate(this.inputJson);
          } else if (this.inputJson.hasOwnProperty("Value")) {
            this.oneTranslate(this.inputJson.Value);
          } else {
            //翻译key的值
            this.translateValue(this.inputJson);
          }
        } else {
          this.oneTranslate(inputData);
        }
      } else {
        this.$message.error("输入有误");
      }
      return Promise.resolve(this.resultJson);
    },
    checkInput(param) {
      console.log("检查是否json");
      try {
        var obj = JSON.parse(param);
        if (typeof obj == "object" && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.log("error:" + e);
        return false;
      }
    },
    getRandom() {
      //生成10位随机数
      var random = Math.floor(
        (Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 10 - 1)
      );
      this.salt = random;
    },
    getSign() {
      var str = this.appID + this.q + this.salt + this.appKey;
      this.sign = this.$md5(str);
    },
    batchTranslate(param) {
      console.log("开始批量翻译");
      var resultObj = param;
      var text = "";
      var j = 0;
      var textArray = [];
      var textIndexArray = [];
      this.loadingTranslate = true;
      for (var index = 0; index < param.length; index++) {
        var item = param[index];
        var textItem = item.Value;
        if (!textItem) {
          textItem = "hello";
        }
        if (textItem == "") {
          textItem = "hello";
        }
        if (textItem === " ") {
          textItem = "hello";
        }
        if (!textItem.replace(/^\s+|\s+$/g, "")) {
          textItem = "hello";
        }
        var currentText = text + "\n" + textItem;
        if (currentText.length < 1000) {
          if (!text) {
            text = textItem;
          } else {
            text = text + "\n" + textItem;
          }
          if (index + 1 === param.length && textArray.length > 0) {
            textArray.push(text);
            textIndexArray.push(index);
          }
        } else {
          textArray.push(currentText);
          textIndexArray.push(index);
          text = "";
        }
      }
      if (textArray.length === 0) {
        //console.log('待翻译数据拼接：', text);
        this.q = text;
        this.translateReq();
        var resJson = [];
        var params = new URLSearchParams();
        params.append("q", this.q);
        params.append("from", this.key);
        params.append("to", this.key2);
        params.append("appid", this.appID);
        params.append("salt", this.salt);
        params.append("sign", this.sign);
        if (this.key2 === "en") {
          params.append("action", "1");
        }
        this.axios
          .post("/api", params)
          .then((res) => {
            console.log(res);
            if (res.data.error_code === "52001") {
              this.$message.error("请求超时，请稍后再试！");
              this.loadingTranslate = false;
              return;
            }
            if (res.data.error_code != undefined) {
              this.$message.error("请求失败，请稍后再试！");
              this.loadingTranslate = false;
              return;
            }
            text = "";
            var k = res.data.trans_result.length;
            for (var i = 0; i < k; i++) {
              resultObj[i].Value = res.data.trans_result[i].dst;
            }
            this.showResult2 = false;
            this.showResult1 = true;
            resultObj.forEach((item) => {
              if (
                item.Value == "hello" ||
                item.Value == "Hello" ||
                item.Value === "你好" ||
                item.value === "Olá."
              ) {
                item.Value = "";
              }
              var resItem = {
                Id: item.Id,
                Value: item.Value,
                Comment: item.Comment,
              };
              resJson.push(resItem);
            });
            console.log("翻译结果:");
            this.resultJson = resJson;
            console.log(this.resultJson);
            this.loadingTranslate = false;
          })
          .catch((err) => {
            this.loadingTranslate = false;
            if (!err) {
              return;
            }
            console.log(err);
          });
      } else {
        console.log("数据超长拆分翻译,共" + textArray.length + "组:", textArray);
        this.batchTranslateChild(
          0,
          textArray.length,
          textArray,
          resultObj
        ).then((res) => {});
      }
    },
    async batchTranslateChild(index, length, textArray, resultObj) {
      var textItem = textArray[index];
      this.q = textItem;
      this.translateReq();
      var resJson = [];
      var params = new URLSearchParams();
      params.append("q", this.q);
      params.append("from", this.key);
      params.append("to", this.key2);
      params.append("appid", this.appID);
      params.append("salt", this.salt);
      params.append("sign", this.sign);
      if (this.key2 === "en") {
        params.append("action", "1");
      }
      console.log(
        "开始翻译第" + (index + 1) + "组，长度：" + textItem.length + "\n",
        textItem.split(/[\r\n]/g)
      );
      var reFlag = false;
      await this.axios
        .post("/api", params)
        .then((res) => {
          console.log(res);
          if (res.data.error_code === "52001") {
            this.$message.warning("第" + index + "次请求超时，请稍后再试！");
            this.loadingTranslate = false;
            return;
          }
          if (res.data.error_code != undefined) {
            this.$message.warning("请求失败，请稍后再试！");
            this.loadingTranslate = false;
            return;
          }
          var k = res.data.trans_result.length;
          var startIndex = 0;
          for (var realIndex = 0; realIndex <= index; realIndex++) {
            if (realIndex > 0) {
              startIndex = startIndex + textArray[realIndex - 1].split(/[\r\n]/g).length;
            }
          }
          var resObjIndex = startIndex;
          for (var i = 0; i < k; i++) {
            resultObj[resObjIndex].Value = res.data.trans_result[i].dst;
            resObjIndex++;
          }

          for (var reIn = startIndex; reIn < startIndex + k; reIn++) {
            var item = resultObj[reIn];
            if (
              item.Value == "hello" ||
              item.Value == "Hello" ||
              item.Value === "你好" ||
              item.value === "Olá."
            ) {
              item.Value = "";
            }
            var resItem = {
              Id: item.Id,
              Value: item.Value,
              Comment: item.Comment,
            };
            resJson.push(resItem);
          }
          this.showResult2 = false;
          this.showResult1 = true;
          console.log("拆分翻译结果" + index + ":", resJson);
          setTimeout(() => {
            if (++index < length) {
              this.batchTranslateChild(index, length, textArray, resultObj).then(
                (res) => {
                  this.resultJson = resultObj;
                }
              );
            } else {
              this.loadingTranslate = false;
              this.$message.success("翻译完成");
              reFlag = true;
            }
          }, 100);
        })
        .catch((err) => {
          this.loadingTranslate = false;
          if (!err) {
            return;
          }
          console.log(err);
        });
      return reFlag;
    },
    oneTranslate(param) {
      this.resultText = "";
      this.q = param;
      this.translateReq();
      var params = new URLSearchParams();
      params.append("q", this.q);
      params.append("from", this.key);
      params.append("to", this.key2);
      params.append("appid", this.appID);
      params.append("salt", this.salt);
      params.append("sign", this.sign);
      return this.axios
        .post("/api", params)
        .then((res) => {
          console.log(res);
          if (res.data.error_code === "52001") {
            this.$message.warning("请求超时，请稍后再试！");
            return;
          }
          if (res.data.error_code != undefined) {
            this.$message.warning("请求失败，请稍后再试！");
            return;
          }
          this.resultText = res.data.trans_result[0].dst;
          console.log(this.resultText);
          this.showResult1 = false;
          this.showResult2 = true;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    translateValue(param) {
      this.translateReq();
      this.resultText = "";
      var text = "";
      for (let i in param) {
        text = text + param[i] + "\n";
      }
      this.q = text;
    },
    translateReq() {
      this.getRandom();
      this.getSign();
      this.resultJson = [];
    },
    toResource() {
      console.log("开始转换");
      var text = this.inputText.replace(/\n/g, "");
      var textArr = text.split("#");
      console.log(textArr);
      var resJson = [];
      var id = this.resourceID;
      var newIDArr = [];
      var i = 1;
      var copyDataItem = "";
      textArr.forEach((item) => {
        var newID = id + (Array(3).join(0) + i).slice(-3);
        var resItem = {
          Id: newID,
          Value: item,
          Comment: item,
        };
        resJson.push(resItem);
        var newIdItem = { key: newID };
        newIDArr.push(newIdItem);
        copyDataItem = copyDataItem + newID + "\n";
        i++;
      });
      this.copyData = copyDataItem;
      this.formatJson = resJson;
      this.formatID = newIDArr;
      console.log("生成的key：", newIDArr);
      console.log("JSON生成的key：", this.formatID);
      this.showResult1 = false;
      this.showResult2 = false;
      this.showResult3 = true;
      this.copyButton = "copy";
    },
    handleRemove(file, fileList) {
      console.log("handleRemove", file, fileList);
    },
    handlePreview(file) {
      console.log("handlePreview", file);
    },
    beforeUpload(file) {
      console.log(this.fileList);
      console.log("beforeUpload", file);
    },
    uploadFile(param) {
      console.log("uploadFile", param);
      return;
    },
    changeFile(file, fileList) {
      console.log("on-change", file, fileList);
      this.chooseFileList = [];
      this.chooseFileList = fileList;
      return;
    },
    exportJson(jsonStr, filename) {
      var data = JSON.stringify(jsonStr);
      console.log("导出data", data);
      var blob = new Blob([data], { type: "" });
      var savename = filename.substring(0, filename.lastIndexOf(".") + 1) + "lres";
      FileSaver.saveAs(blob, savename);
    },
    batchExportJson() {
      this.results2.forEach((item) => {
        var data = JSON.stringify(item.jsonStr);
        console.log("导出data", data);
        var blob = new Blob([data], { type: "" });
        var savename = item.name.substring(0, item.name.lastIndexOf(".") + 1) + "lres";
        FileSaver.saveAs(blob, savename);
      });
    },
    readFileText() {
      console.log("读取文件");
      this.loadtext = "开始读取";
      this.loading = true;
      var readFilesJson = [];
      console.log("文件个数", this.chooseFileList.length);
      if (this.chooseFileList.length <= 0) {
        this.$message.error("请先上传文件");
        this.loading = false;
        return;
      }
      this.chooseFileList.forEach((item) => {
        //item 是File类型
        console.log(item, typeof item);
        var url = URL.createObjectURL(item.raw);
        var file = item.raw;
        var reader = new FileReader();
        reader.readAsText(file);
        setTimeout(() => {
          var text = reader.result;
          var readItem = {
            name: file.name,
            jsonStr: text,
          };
          readFilesJson.push(readItem);
          console.log(readFilesJson);
          this.chooseJson = readFilesJson;
          if (this.chooseJson.length == this.chooseFileList.length) {
            this.loading = false;
            this.$message.success("读取完成");
          }
        }, 500);
      });
    },
    translateFile() {
      console.log("开始翻译");
      this.loadtext = "开始翻译";
      this.loading = true;
      this.results2 = [];
      if (this.key == "") {
        this.$message.error("请选择原语言");
        this.loading = false;
        return;
      }
      if (this.key2 == "") {
        this.$message.error("请选择目标语言");
        this.loading = false;
        return;
      }
      if (this.chooseFileList.length <= 0) {
        this.$message.error("请上传文件");
        this.loading = false;
        return;
      }
      if (this.chooseFileList.length > 0 && this.chooseJson.length <= 0) {
        this.$message.error("请点击读取文件");
        this.loading = false;
        return;
      }
      var jsonArray = this.chooseJson;
      var result2 = [];
      this.transFileChild(0, jsonArray.length, jsonArray);
    },
    transFileChild(index, length, jsonArray) {
      var currentK = index;
      var data = jsonArray[currentK];
      console.log("第" + currentK + "次循环");
      var jsonOb = JSON.parse(data.jsonStr);
      this.inputText = JSON.stringify(jsonOb.Content.StringResources);
      var param = JSON.parse(this.inputText);
      var resultObj = param;
      var text = "";
      var j = 0;
      var textArray = [];
      var textIndexArray = [];
      for (var index = 0; index < param.length; index++) {
        var item = param[index];
        var textItem = item.Value;
        if (!textItem) {
          textItem = "hello";
        }
        if (textItem == "") {
          textItem = "hello";
        }
        var currentText = text + "\n" + textItem;
        if (currentText.length < 2000) {
          if (!text) {
            text = textItem;
          } else {
            text = text + "\n" + textItem;
          }
        } else {
          textArray.push(currentText);
          this.$message.error("资源内容超长，复制资源内容使用功能1翻译");
          return;
        }
      }
      if (textArray.length === 0) {
        console.log("翻译文本", text);
        this.q = text;
        this.translateReq();
        var resJson = [];
        var params = new URLSearchParams();
        params.append("q", this.q);
        params.append("from", this.key);
        params.append("to", this.key2);
        params.append("appid", this.appID);
        params.append("salt", this.salt);
        params.append("sign", this.sign);
        if (this.key2 === "en") {
          params.append("action", "1");
        }
        this.axios
          .post("/api", params)
          .then((res) => {
            console.log("第" + currentK + "次请求的结果", res);
            text = "";
            var k = res.data.trans_result.length;
            for (var i = 0; i < k; i++) {
              resultObj[i].Value = res.data.trans_result[i].dst;
            }
            this.showResult2 = false;
            this.showResult1 = true;
            resultObj.forEach((item) => {
              if (
                item.Value == "hello" ||
                item.Value == "Hello" ||
                item.Value === "你好" ||
                item.value === "Olá."
              ) {
                item.Value = "";
              }
              var resItem = {
                Id: item.Id,
                Value: item.Value,
                Comment: item.Comment,
              };
              resJson.push(resItem);
            });
            console.log("翻译结果:", resJson);
            jsonOb.Content.StringResources = resJson;
            var resJsonItem = {
              name: data.name,
              jsonStr: jsonOb,
            };
            this.results2.push(resJsonItem);
            setTimeout(() => {
              if (++currentK < length) {
                this.transFileChild(currentK, length, jsonArray);
              } else {
                this.loading = false;
                this.$message.success("翻译完成");
              }
            }, 1000);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        var resJsonMap = {};
        var currentArrayIndex = 0;
        for (var arrayIndex = 0; arrayIndex < textArray.length; arrayIndex++) {
          setTimeout(() => {
            var textItem = textArray[arrayIndex];
            this.q = textItem;
            this.translateReq();
            var resJson = [];
            var params = new URLSearchParams();
            params.append("q", this.q);
            params.append("from", this.key);
            params.append("to", this.key2);
            params.append("appid", this.appID);
            params.append("salt", this.salt);
            params.append("sign", this.sign);
            if (this.key2 === "en") {
              params.append("action", "1");
            }
            this.axios
              .post("/api", params)
              .then((res) => {
                console.log("第" + currentK + "次请求的结果", res);
                if (res.data.error_code === "52001") {
                  this.$message.warning(
                    "第" +
                      currentK +
                      "个文件拆分后的第" +
                      arrayIndex +
                      "次请求超时，请稍后再试！"
                  );
                  return;
                }
                if (res.data.error_code != undefined) {
                  this.$message.warning("请求失败，请稍后再试！");
                  return;
                }
                text = "";
                var k = res.data.trans_result.length;
                for (var i = 0; i < k; i++) {
                  resultObj[i].Value = res.data.trans_result[i].dst;
                }
                this.showResult2 = false;
                this.showResult1 = true;
                resultObj.forEach((item) => {
                  if (
                    item.Value == "hello" ||
                    item.Value == "Hello" ||
                    item.Value === "你好" ||
                    item.value === "Olá."
                  ) {
                    item.Value = "";
                  }
                  var resItem = {
                    Id: item.Id,
                    Value: item.Value,
                    Comment: item.Comment,
                  };
                  resJson.push(resItem);
                });
                resJsonMap[arrayIndex] = resJson;
                currentArrIndex = currentArrIndex + 1;
              })
              .catch((err) => {
                console.log(err);
              });
          }, 1000);
        }
        var resJsonArray = [];
        for (var mapkey = 0; mapkey < textArray.length; keyMap++) {
          if (!resJsonMap[mapkey]) {
            this.$message.error(
              "拆分数据后第" +
                currentK +
                "个文件的第" +
                keyMap +
                "次请求出错，尝试重新翻译或复制资源文件内容使用功能1翻译"
            );
            return;
          }
          resJsonArray = resJsonArray.concat(resJsonMap[mapkey]);
        }
        jsonOb.Content.StringResources = resJsonArray;
        var resJsonItem = {
          name: data.name,
          jsonStr: jsonOb,
        };
        this.results2.push(resJsonItem);
        setTimeout(() => {
          if (++currentK < length) {
            this.transFileChild(currentK, length, jsonArray);
          } else {
            this.loading = false;
            this.$message.success("翻译完成");
          }
        }, 2000);
      }
    },
    toBeResource() {
      if (!this.inputText) {
        this.$message.error("先粘贴BE元数据内容");
      }
      var labelKey = this.fieldID;
      var labelName = this.fieldName;
      if (!labelKey || !labelName) {
        this.$message.error("输入BE字段编号和BE字段名称");
        return;
      }
      if (!this.fieldNumber) {
        this.$message.error("输入要添加的字段个数");
        return;
      }
      var labelKeyArr = labelKey.split("#");
      var labelNameArr = labelName.split("#");
      if (labelKeyArr.length != labelNameArr.length) {
        this.$message.error("BE字段编号与BE字段名个数应该统一！");
        return;
      }
      var be = JSON.parse(this.inputText);
      var content = be.Content;
      var mainObject = content.MainObject;
      var ele = mainObject.ContainElements;
      if (this.beChildCode && this.beChildCode != "") {
        var flag = false;
        var childArr = mainObject.ContainChildObjects;
        for (var i = 0; i < childArr.length; i++) {
          if (childArr[i].Code == this.beChildCode) {
            ele = childArr[i].ContainElements;
            flag = true;
            break;
          }
        }
        if (!flag || flag == false) {
          this.$message.error("当前BE不存在子节点" + this.beChildCode);
          return;
        }
      }
      var i18nKey = ele[0]["I18nResourceInfoPrefix"];
      var I18nResourceInfoPrefix = i18nKey.slice(0, i18nKey.lastIndexOf(".") + 1);
      var keyLength = 0;
      keyLength = labelKeyArr.length;
      for (var j = 0; j < keyLength; j++) {
        var newLabelID = labelKeyArr[j];
        var newLabelName = labelNameArr[j];
        for (var i = 1; i < 100; i++) {
          var code = (Array(2).join(0) + i).slice(-2);
          var labelID = newLabelID + code;
          var fieldName = newLabelName + code;
          var uuid = uuidv1();
          let item = this.getItem();
          item.LabelID = labelID;
          item.Code = labelID;
          item.Name = fieldName;
          item.ID = uuid;
          item.I18nResourceInfoPrefix = I18nResourceInfoPrefix + labelID;
          ele.push(item);
        }
      }
      this.formatJson = be;
      this.showResult3 = true;
    },
    getItem() {
      var item = {
        ID: "19f81c40-d140-4706-8a43-b0daa1ba6009",
        LabelID: "Code",
        IsRef: false,
        I18nResourceInfoPrefix:
          "Inspur.GS.FI.GL.AccountingPortfolioLimit.AccountingPortfolioLimit.AccountingPortfolioLimit.Code",
        ChildAssociations: [],
        ColumnID: "",
        BelongModelID: "",
        Code: "Code",
        Name: "编号",
        ObjectType: "None",
        MDataType: "String",
        DefaultValue: "",
        DefaultValueType: 0,
        Length: 36,
        Precision: 0,
        IsRequire: false,
        IsMultiLanguage: false,
        IsRefElement: false,
        RefElementID: "",
        IsUdt: false,
        UdtPkgName: null,
        UdtID: null,
        UdtName: null,
        IsVirtual: false,
        DynamicPropSetInfo: {
          DynamicPropRepositoryComp: null,
          DynamicPropSerializerComp: null,
        },
        CustomizationInfo: {
          Customized: false,
          DimensionInfo: {
            FirstDimension: null,
            SecondDimension: null,
          },
        },
        EnumIndexType: 0,
        BeLabel: [],
        ContainEnumValues: [],
        CollectionType: "None",
        IsFromAssoUdt: false,
        BillCodeConfig: {
          CanBillCode: false,
          CodeGenerateOccasion: "SystemProcess",
          CodeGenerateType: "none",
          BillCodeName: "",
          BillCodeID: "",
        },
        Readonly: false,
        IsCustomItem: false,
        CalculationExpress: null,
        ValidationExpress: null,
        IsDefaultNull: false,
        RequiredCheckOccasion: "All",
      };
      return item;
    },
    handleClick(tab, event) {
      Object.assign(this.$data, this.$options.data());
      console.log(tab, event);
      var inputLanguageData = localStorage.getItem("inputLanguage");
      if (inputLanguageData != undefined) {
        try {
          var inputLanguage = JSON.parse(inputLanguageData);
          var lan1 = inputLanguage.originalLanguage;
          var lan2 = inputLanguage.translateLanguage;
          this.key = lan1;
          this.key2 = lan2;
        } catch {}
      }
      if (tab.index == "0" || tab.index == "1" || tab.index == "2") {
        this.inputSelf = true;
      }
      if (tab.index == "3") {
        this.inputSelf = false;
      }
    },
    beforeChangeTab(activeName, oldActiveName, tab) {
      // console.log(activeName, oldActiveName, tab);
      // if (
      //   activeName == "sixth" ||
      //   activeName == "seventh" ||
      //   activeName == "eighth" ||
      //   activeName == "ninth" ||
      //   activeName == "tenth"
      // ) {
      //   return false;
      // }
    },
    handleRemove2(file, fileList) {
      console.log("handleRemove", file, fileList);
    },
    handlePreview2(file) {
      console.log("handlePreview", file);
    },
    beforeUpload2(file) {
      console.log(this.fileList);
      console.log("beforeUpload", file);
    },
    uploadFile2(param) {
      console.log("uploadFile", param);
      return;
    },
    changeFile2(file, fileList) {
      console.log("on-change", file, fileList);
      this.chooseFileList = [];
      this.chooseFileList = fileList;
      return;
    },
    restartService() {
      if (
        !this.autoPatchForm.ip ||
        !this.autoPatchForm.port ||
        !this.autoPatchForm.username ||
        !this.autoPatchForm.password
      ) {
        this.$message.error("填写所有必填项！");
        return;
      }
      if (this.autoPatchForm.patchType == "1" && this.fileList2.length == 0) {
        this.$message.error("上传补丁文件！");
        return;
      }
      this.$notify.error({
        title: "错误！！！！",
        message: "这是一个假的的按钮",
      });
    },
    installPatch() {
      if (
        !this.autoPatchForm.ip ||
        !this.autoPatchForm.port ||
        !this.autoPatchForm.username ||
        !this.autoPatchForm.password
      ) {
        this.$message.error("填写所有必填项！");
        return;
      }
      if (this.autoPatchForm.patchType == "1" && this.fileList2.length == 0) {
        this.$message.error("上传补丁文件！");
        return;
      }
      this.$notify.error({
        title: "错误！！！！",
        message: "这暂时是一个假的的按钮",
      });
      this.$notify.error({
        title: "错误！！！！",
        message: "这暂时是一个假的按钮",
      });
    },
    // 2、节流函数体
    modifyTitle() {
      var _this = this;
      console.log("开始");
      _this.throttle(_this.sayThrottle());
    },
    //复制
    copySourceKeys() {},
    //打开弹窗
    openDialog() {
      this.dialogVisible = true;
    },
    // 复制成功
    onCopy(e) {
      this.$notify.success({
        title: "复制成功",
        message: "",
      });
    },
    // 复制失败
    onError(e) {
      this.$notify.error({
        title: "复制失败",
        message: "",
      });
    },
    catchData(value) {
      console.log("Editor参数:", value);
    },
    openDialog2() {
      this.dialogVisible2 = true;
    },
  },
  mounted() {
    var inputLanguageData = localStorage.getItem("inputLanguage");
    if (inputLanguageData != undefined) {
      try {
        var inputLanguage = JSON.parse(inputLanguageData);
        var lan1 = inputLanguage.originalLanguage;
        var lan2 = inputLanguage.translateLanguage;
        this.key = lan1;
        this.key2 = lan2;
      } catch {}
    }
    var that = this;
    var winHeight = window.innerHeight;
    var doc = document.getElementById("translateMainDiv");
    var docHeight = "600px";
    if (winHeight > 600) {
      doc.style.height = winHeight + "px";
    }
  },
};
</script>

<style scoped>
.choose {
  text-align: left;
  height: 120px;
  overflow-y: auto;
  border-bottom: 2px dashed #92f1d5;
  padding-left: 20px;
  padding-top: 5px;
}
h5 {
  padding: 0 0 0 0;
  margin: 0 0 0 0;
  text-align: center;
  overflow: hidden;
}
.choose2 {
  text-align: left;
  width: 700px;
  height: 120px;
  border: 1px dashed #808a87;
  padding-top: 30px;
  padding-bottom: 30px;
  margin-left: 630px;
}
.button2 {
  float: left;
}
.transButton {
  margin-left: 20px;
  margin-right: 20px;
}
.translateArea {
  margin: 0 0 0 0;
}
.input {
  display: inline-block;
  margin: 0 0 0 0;
  padding: 2px;
  width: 48%;
  height: 500px;
  text-align: left;
  margin-right: 15px;
  float: left;
}
.result {
  display: inline-block;
  vertical-align: top;
  padding: 2px;
  width: 48%;
  height: 500px;
  text-align: left;
  margin-left: 15px;
  float: right;
}
.inputArea {
  margin-top: 5px;
}
.resultArea {
  margin-top: 5px;
}
.uploadBox {
  float: left;
}
.fileList {
  width: 260px;
  border: burlywood 1px dashed;
  height: 180px;
  float: left;
  overflow: auto;
}
li {
  padding: 0 0 0 0;
  margin: 0 0 0 0;
  text-align: left;
}
.header {
  height: 200px;
}
.jsonviewr {
  text-align: left;
}
.button3 {
  margin: 2 2 2 2;
}
.el-row-col {
  height: auto;
}
.button2 {
  padding: 2px 2px;
  margin: 2px 2px;
}
.toTranslate {
  padding: 5px;
  border: 1px dashed #808a87;
  display: inline-block;
  margin: 2px;
  border-radius: 5px;
}
.toBeResource {
  padding: 5px;
  border: 1px dashed #808a87;
  display: inline-block;
  margin: 2px;
  border-radius: 5px;
}
.toExceptionResource {
  padding: 5px;
  border: 1px dashed #808a87;
  display: inline-block;
  margin: 2px;
  border-radius: 5px;
}
.el-form-item {
  width: 430px;
}
.el-form-item .el-input {
  width: 300px;
}
.el-form-item .el-select {
  width: 300px;
}
.autoInstallPatchArea {
  padding-top: 10px;
}
.autoInstallPatchForm {
  margin: 0 auto;
  text-align: center;
  width: 420px;
  padding: 30px;
  border-radius: 6px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12), 0 0 8px rgba(0, 0, 0, 0.04);
}
.uploadBox2 {
  background-color: #fff;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  box-sizing: border-box;
  width: 300x;
  height: 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.item {
  margin-bottom: 5px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}
.box-card {
  height: 560px;
}
.showResourceKey {
  margin: 0 auto;
  width: 100%;
}
</style>
