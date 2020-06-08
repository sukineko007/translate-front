<template>
  <div class="translate">
    <div class="choose">
      <el-tabs v-model="activeName" @tab-click="handleClick">
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
              ></el-option>
            </el-select>目标语言：
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
              style="width: 220px; margin-right:10px"
            ></el-input>
            <el-input
              type="text"
              placeholder="BE字段名"
              v-model="fieldName"
              style="width: 220px;margin-right:10px"
            ></el-input>
            <el-input
              type="number"
              placeholder="字段数"
              v-model="fieldNumber"
              style="width: 98px; margin-right:10px"
            ></el-input>
            <el-input
              type="text"
              placeholder="BE节点编号(不输默认主节点)"
              v-model="beChildCode"
              style="width: 300px; margin-right:10px"
            ></el-input>
            <el-button type="success" @click="toBeResource" class="button">BE加字段</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="功能3" name="third">
          <span>功能3：</span>
          <div class="toExceptionResource">
            <el-input
              type="text"
              placeholder="资源文件key(自动补3位数字)"
              v-model="resourceID"
              style="width: 400px;"
            ></el-input>
            <el-button type="primary" @click="toResource" class="button" plain>转资源文件格式</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="功能4" name="fouth">
          <p style="margin: 0">
            使用说明：点击上传选择要翻译的***.en.lres文件或者直接将文件拖到上传框,文件列表框出现选择的文件列表后，点击读取文件，提示读取完成后，选择目标语言，然后点开始翻译,
            翻译完成后可单独导出文件或一键导出全部，直接替换原来的***.en.lres文件即可。注：上传后不支持更换或者移除文件，如需更换或者移除请刷新浏览器
          </p>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="translateArea" v-if="inputSelf">
      <div class="input">
        <div class="inputArea">
          <el-input
            :autosize="{ minRows: 20, maxRows: 20}"
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
            :autosize="{ minRows: 20, maxRows: 20}"
            type="textarea"
            placeholder
            v-model="resultText"
            :readonly="true"
          ></el-input>
          <json-viewer v-if="showResult1" :value="resultJson" :expand-depth="5" copyable boxed></json-viewer>
          <json-viewer v-if="showResult3" :value="formatJson" :expand-depth="5" copyable boxed></json-viewer>
        </div>
      </div>
    </div>
    <div
      class="uploadFile"
      v-if="!inputSelf"
      v-loading="loading"
      :element-loading-text="loadtext"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
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
            <li v-for="item in chooseFileList" :key="item.name">{{item.name}}</li>
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
            ></el-option>
          </el-select>目标语言：
          <el-select v-model="key2" placeholder="请选择目标语言" style="width: 160px">
            <el-option
              v-for="item in languageData"
              :key="item.id"
              :label="item.value"
              :value="item.id"
              :disabled="item.disabled"
            ></el-option>
          </el-select>
          <el-button type="warning" @click="readFileText" class="button">读取文件</el-button>
          <el-button type="primary" @click="translateFile" class="button">开始翻译</el-button>
        </div>
      </div>
      <div class="uploadResult">
        <el-button
          type="success"
          @click="batchExportJson()"
          v-if="results2.length > 0"
          class="button3"
        >一键导出全部</el-button>
        <el-row>
          <el-col :span="12" class="el-row-col" v-for="item in results2" :key="item.name">
            <el-button
              type="success"
              @click="exportJson(item.jsonStr, item.name)"
              class="button3"
            >导出文件</el-button>
            <h5>{{item.name}}</h5>
            <json-viewer :value="item.jsonStr" :expand-depth="5" copyable boxed class="jsonviewr"></json-viewer>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import JsonViewer from "../../node_modules/vue-json-viewer";
import FileSaver from "file-saver";
import uuidv1 from "uuid/v1";
export default {
  components: {
    jsonViewer: JsonViewer
  },
  data() {
    return {
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
          disabled: true
        },
        {
          id: "zh",
          value: "中文"
        },
        {
          id: "en",
          value: "英语"
        },
        {
          id: "yue",
          value: "粤语"
        },
        {
          id: "wyw",
          value: "文言文"
        },
        {
          id: "jp",
          value: "日语"
        },
        {
          id: "kor",
          value: "韩语"
        },
        {
          id: "fra",
          value: "法语"
        },
        {
          id: "spa",
          value: "西班牙语"
        },
        {
          id: "th",
          value: "泰语"
        },
        {
          id: "ara",
          value: "阿拉伯语"
        },
        {
          id: "ru",
          value: "俄语"
        },
        {
          id: "pt",
          value: "葡萄牙语"
        },
        {
          id: "de",
          value: "德语"
        },
        {
          id: "it",
          value: "意大利语"
        },
        {
          id: "el",
          value: "希腊语"
        },
        {
          id: "nl",
          value: "荷兰语"
        },
        {
          id: "pl",
          value: "波兰语"
        },
        {
          id: "bul",
          value: "保加利亚语"
        },
        {
          id: "est",
          value: "爱沙尼亚语"
        },
        {
          id: "dan",
          value: "丹麦语"
        },
        {
          id: "fin",
          value: "芬兰语"
        },
        {
          id: "cs",
          value: "捷克语"
        },
        {
          id: "rom",
          value: "罗马尼亚语"
        },
        {
          id: "slo",
          value: "斯洛文尼亚语"
        },
        {
          id: "swe",
          value: "瑞典语"
        },
        {
          id: "hu",
          value: "匈牙利语"
        },
        {
          id: "cht",
          value: "繁体中文"
        },
        {
          id: "vie",
          value: "越南语"
        }
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
        Comment: ""
      },
      resultItem: {
        Id: "",
        Value: "",
        Comment: ""
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
      jsonObData: null
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
      if (this.key == "") {
        this.$message.error("请选择原语言");
        return;
      }
      if (this.key2 == "") {
        this.$message.error("请选择目标语言");
        return;
      }
      if (this.inputText == "") {
        this.$message.error("请输入待翻译文本");
        return;
      }
      var inputData = this.inputText;
      if (typeof inputData == "string") {
        var that = this;
        if (that.checkInput(inputData) == true) {
          this.inputJson = JSON.parse(inputData);
          console.log(this.inputJson);
          if (this.inputJson instanceof Array) {
            //资源文件翻译
            this.batchTranslate(this.inputJson);
          } else if (this.inputJson.hasOwnProperty("Comment")) {
            this.oneTranslate(this.inputJson.Comment);
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
        (Math.random() + Math.floor(Math.random() * 9 + 1)) *
          Math.pow(10, 10 - 1)
      );
      this.salt = random;
    },
    getSign() {
      var str = this.appID + this.q + this.salt + this.appKey;
      this.sign = this.$md5(str);
    },
    batchTranslate(param) {
      console.log("批量翻译");
      var resultObj = param;
      var text = "";
      var j = 0;
      param.forEach(item => {
        if (!item.Value) {
          item.Value = "hello";
        }
        if (item.Value == "") {
          item.Value = "hello";
        }
        text = text + "\n" + item.Value;
      });
      console.log("textValue", text);
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
      params.append("action", "1");
      this.axios
        .post("/api", params)
        .then(res => {
          console.log(res);
          text = "";
          var k = res.data.trans_result.length;
          for (var i = 0; i < k; i++) {
            resultObj[i].Value = res.data.trans_result[i].dst;
          }
          this.showResult2 = false;
          this.showResult1 = true;
          resultObj.forEach(item => {
            if (item.Value == "hello" || item.Value == "Hello") {
              item.Value = "";
            }
            var resItem = {
              Id: item.Id,
              Value: item.Value,
              Comment: item.Comment
            };
            resJson.push(resItem);
          });
          console.log("翻译结果:");
          this.resultJson = resJson;
          console.log(this.resultJson);
        })
        .catch(err => {
          console.error(err);
        });
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
        .then(res => {
          console.log(res);
          this.resultText = res.data.trans_result[0].dst;
          console.log(this.resultText);
          this.showResult1 = false;
          this.showResult2 = true;
        })
        .catch(err => {
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
      console.log("随机数：" + this.salt);
      this.getSign();
      console.log("当前sign:" + this.sign);
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
      textArr.forEach(item => {
        var newID = id + (Array(3).join(0) + i).slice(-3);
        var resItem = {
          Id: newID,
          Value: item,
          Comment: item
        };
        resJson.push(resItem);
        newIDArr.push(newID);
        i++;
      });
      this.formatJson = resJson;
      this.formatID = JSON.stringify(newIDArr);
      this.showResult1 = false;
      this.showResult2 = false;
      this.showResult3 = true;
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
      var savename =
        filename.substring(0, filename.lastIndexOf(".") + 1) + "lres";
      FileSaver.saveAs(blob, savename);
    },
    batchExportJson() {
      this.results2.forEach(item => {
        var data = JSON.stringify(item.jsonStr);
        console.log("导出data", data);
        var blob = new Blob([data], { type: "" });
        var savename =
          item.name.substring(0, item.name.lastIndexOf(".") + 1) + "lres";
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
      this.chooseFileList.forEach(item => {
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
            jsonStr: text
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
      param.forEach(item => {
        if (!item.Value) {
          item.Value = "蜂";
        }
        if (item.Value == "") {
          item.Value = "蜂";
        }
        text = text + "\n" + item.Value;
      });
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
      params.append("action", "1");
      this.axios
        .post("/api", params)
        .then(res => {
          console.log("第" + currentK + "次请求的结果", res);
          text = "";
          var k = res.data.trans_result.length;
          for (var i = 0; i < k; i++) {
            resultObj[i].Value = res.data.trans_result[i].dst;
          }
          this.showResult2 = false;
          this.showResult1 = true;
          resultObj.forEach(item => {
            if (item.Value == "bee" || item.Value == "Bee") {
              item.Value = "";
            }
            var resItem = {
              Id: item.Id,
              Value: item.Value,
              Comment: item.Comment
            };
            resJson.push(resItem);
          });
          console.log("翻译结果:", resJson);
          jsonOb.Content.StringResources = resJson;
          var resJsonItem = {
            name: data.name,
            jsonStr: jsonOb
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
        .catch(err => {
          console.log(err);
        });
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
      var I18nResourceInfoPrefix = i18nKey.slice(
        0,
        i18nKey.lastIndexOf(".") + 1
      );
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
          DynamicPropSerializerComp: null
        },
        CustomizationInfo: {
          Customized: false,
          DimensionInfo: {
            FirstDimension: null,
            SecondDimension: null
          }
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
          BillCodeID: ""
        },
        Readonly: false,
        IsCustomItem: false,
        CalculationExpress: null,
        ValidationExpress: null,
        IsDefaultNull: false,
        RequiredCheckOccasion: "All"
      };
      return item;
    },
    handleClick(tab, event) {
      Object.assign(this.$data, this.$options.data());
      console.log(tab, event);
      if (tab.index == "0" || tab.index == "1" || tab.index == "2") {
        this.inputSelf = true;
      }
      if (tab.index == "3") {
        this.inputSelf = false;
      }
    }
  }
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
</style>
