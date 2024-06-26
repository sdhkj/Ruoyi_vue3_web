<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请时间" prop="createTime">
        <el-date-picker clearable
          v-model="queryParams.createTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择申请时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:verify:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:verify:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:verify:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:verify:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
<!--      <el-table-column label="用户id" align="center" prop="userId" />-->
      <el-table-column label="姓名" align="center" prop="nickName" />
<!--      <el-table-column label="借用设备id" align="center" prop="deviceId" />-->
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="申请时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
<!--      0审核中，1通过，2未通过-->
<!--      <el-table-column label="审核状态" align="center" prop="verifyStatus" />-->
      <el-table-column label="审核状态" align="center" >
        <template #default="scope">
          <span v-if="scope.row.verifyStatus === '1'">审核通过</span>
          <span v-else-if="scope.row.verifyStatus === '2'">审核不通过</span>
          <span v-else-if="scope.row.verifyStatus === '0'">审核中</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
<!--          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:verify:edit']">修改</el-button>-->
<!--          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:verify:remove']">删除</el-button>-->
          <el-button plain type="success"  @click="handleAllow(scope.row)" v-hasPermi="['verify:allow']" :disabled="!isButtonEnabled(scope.row.verifyStatus)">审核通过</el-button>
          <el-button plain type="danger"  @click="handleNotallow(scope.row)" v-hasPermi="['verify:notallow']" :disabled="!isButtonEnabled(scope.row.verifyStatus)">审核不通过</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改借用审核对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="recordRef" :model="form" :rules="rules" label-width="80px">
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Record">
// 引入api
import {
  listRecord,
  getRecord,
  delRecord,
  addRecord,
  updateRecord,
  updateVerifyStatusNotAllow,
  updateStatusAllow,

} from "@/api/record/record";

const { proxy } = getCurrentInstance();

const recordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    createTime: null,
    verifyStatus: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

// 判断归还按钮是否禁用
function isButtonEnabled(status){
  return status === '0';
}


/** 查询借用审核列表 */
function getList() {
  loading.value = true;
  listRecord(queryParams.value).then(response => {
    recordList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    deviceId: null,
    createTime: null,
    verifyStatus: null,
    ruturnStatus: null
  };
  proxy.resetForm("recordRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加借用审核";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getRecord(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改借用审核";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除借用审核编号为"' + _ids + '"的数据项？').then(function() {
    return delRecord(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/record/export', {
    ...queryParams.value
  }, `record_${new Date().getTime()}.xlsx`)
}



/** 审核不通过
 * 将所在行的数据的状态改为2审核不通过 */
function handleNotallow(row){
  proxy.$modal.confirm('是否确认 “审核不通过” ？').then(async function() {
      const data = {
        id:row.id,
        verifyStatus:"2"
      }
      const verifyStatus = "2"
      // console.log(row.id) row.id获取到点击按钮传过来的所在行的id
      await updateVerifyStatusNotAllow(data).then(response => {

        if (response.code === 200) {
          proxy.$modal.msgSuccess("审核不通过");
          getList();
        } else {
          proxy.$modal.msgError(response.msg);
        }


      })
  }).catch(() => {
    proxy.$modal.msgSuccess("点击取消");
  })
}



/** 审核通过
 * 将所在行的数据的审核状态改为1审核通过,归还状态改为0未归还
 * 同时将设备表中剩余数量减1*/
function handleAllow(row){
  proxy.$modal.confirm('是否确认 “审核通过” ？').then(async function() {
    const data = {
      id:row.id,

    }

    await updateStatusAllow(data).then(response => {

      if (response.code === 200) {
        proxy.$modal.msgSuccess("审核通过");
        getList();
      } else {
        proxy.$modal.msgError(response.msg);
      }


    })
  }).catch(() => {
    proxy.$modal.msgSuccess("点击取消");
  })
}

getList();
</script>
