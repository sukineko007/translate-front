<template>
  <div>
  <div><el-button style="" type="primary" @click="generate">转义</el-button></div>  
      <div style="width: 45%;display: inline-block; height: 500px">
        <el-input
          :autosize="{ minRows: 20, maxRows: 20}"
          type="textarea"
          placeholder
          v-model="inputData"
        ></el-input>
      </div>
      <div style="display: inline-block;; width:45%; height: 500px">
      <json-viewer :value="copyData" :expand-depth="5" copyable boxed></json-viewer>
      </div>
  </div>
</template>

<script>
import JsonViewer from "../../node_modules/vue-json-viewer";
export default {
    components:{
        jsonViewer:JsonViewer
    },
  data() {
    return {
      copyData: [],
      inputData: ""
    };
  },
  methods: {
    generate() {
      var temp = JSON.parse(this.inputData);
      var content = [];
      for (var i = 0; i < temp.length; i++) {
        var item = { alt: temp[i].phrase, src: temp[i].url };
        content.push(item);
      };
      this.copyData = content;
    },
    // 复制成功
    onCopy(e) {
      this.$notify.success({
        title: "复制成功",
        message: ""
      });
    },
    // 复制失败
    onError(e) {
      this.$notify.error({
        title: "复制失败",
        message: ""
      });
    }
  }
};
</script>