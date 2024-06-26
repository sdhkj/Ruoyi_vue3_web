<template>
  <div class="app-container" >
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
            v-model="queryParams.deviceName"
            placeholder="请输入设备名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="剩余数量" prop="remainNum">
        <el-input
            v-model="queryParams.remainNum"
            placeholder="请输入剩余数量"
            clearable
            @keyup.enter="handleQuery"
        />
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
            v-hasPermi="['detail:detail:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['detail:detail:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['detail:detail:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['detail:detail:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号"  align="center" prop="id" width="200"/>
      <el-table-column label="设备名称"  prop="deviceName" width="200"/>
<!--      <el-table-column label="所属分类" align="center" prop="categoryId" />-->
      <el-table-column label="所属分类" align="center" prop="categoryName" width="100"/>
      <el-table-column label="剩余数量"  align="center" prop="remainNum" width="240"/>
      <el-table-column label="操作"  class-name="small-padding fixed-width" >
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['detail:detail:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['detail:detail:remove']">删除</el-button>
          <el-button plain type="primary"  @click="handleBorrow(scope.row)" v-hasPermi="['common:device:borrow']">借用</el-button>

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

    <!-- 添加或修改设备详细信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="detailRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
<!--          <el-input v-model="form.categoryId" placeholder="请输入分类名称" />-->


            <el-select v-model="form.categoryId" placeholder="请选择分类" size="medium" style="width: 240px">

              <el-option
                  v-for="item in options"
                  :key="item.id"
                  :label="item.categoryName"
                  :value="item.id"
              />
            </el-select>


        </el-form-item>




        <el-form-item label="剩余数量" prop="remainNum">
          <el-input v-model="form.remainNum" placeholder="请输入剩余数量" />
        </el-form-item>
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

<script setup name="Detail">
import {listDetail, getDetail, delDetail, addDetail, updateDetail, addBorrowRecord} from "@/api/detail/detail";
import { listAllDetail } from "@/api/category/category";
import useUserStore from "@/store/modules/user.js";

const { proxy } = getCurrentInstance();

const detailList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

//设备分类列表
const value = ref('')
const options = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceName: null,
    categoryId: null,
    remainNum: null,
  },
  rules: {
    deviceName: [
      { required: true, message: "设备名称不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "所属分类不能为空", trigger: "change" }
    ],
    remainNum: [
      { required: true, message: "剩余数量不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

function getCatogoryList(){
  listAllDetail().then(response => {
    options.value = response.data;
  });
}

/** 查询设备详细信息列表 */
function getList() {
  loading.value = true;
  listDetail(queryParams.value).then(response => {
    detailList.value = response.rows;
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
    deviceName: null,
    categoryId: null,
    remainNum: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("detailRef");
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
  title.value = "添加设备详细信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getDetail(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改设备详细信息";
  });
}

/** 学生借用设备按钮操作 */
const userStore = useUserStore()
function handleBorrow(row) {

  proxy.$modal.confirm('是否确认借用"' + row.deviceName + '"？').then(async function() {
    const res = await userStore.getInfo()
    console.log(res.user.userId)
    const newBorrowRecord = {
      userId: res.user.userId,// 从pinia的方法中获取当前登录用户ID
      deviceId: row.id, // `row`对象中包含设备ID
      createTime: new Date(), // 使用当前时间作为创建时间
      verifyStatus: "0" // 状态设置为0（表示审核中）

    };
    console.log(newBorrowRecord);
    addBorrowRecord(newBorrowRecord).then(response => {
      if (response.code === 200) {
        proxy.$modal.msgSuccess("请求已提交，审核中");
        getList();
      } else {
        proxy.$modal.msgError(response.msg);
      }
    }, () => {
      proxy.$modal.msgError("请求失败");
    });

  }).catch(() => {
    proxy.$modal.msgSuccess("取消申请");
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["detailRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateDetail(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDetail(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除设备详细信息编号为"' + _ids + '"的数据项？').then(function() {
    return delDetail(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('detail/detail/export', {
    ...queryParams.value
  }, `detail_${new Date().getTime()}.xlsx`)
}

getList();
getCatogoryList();
</script>
