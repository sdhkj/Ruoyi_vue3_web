import request from '@/utils/request'

// 审核通过
export function updateStatusAllow(data){
  return request({
    url: '/system/record/updateAllowStatus',
    method: 'put',
    data: data
  })
}


// 审核不通过
export function updateVerifyStatusNotAllow(data){
  return request({
    url: '/system/record/updateStatus',
    method: 'put',
    data: data
  })
}

// 查询借用审核列表
export function listRecord(query) {
  return request({
    url: '/system/record/list',
    method: 'get',
    params: query
  })
}

// 查询借用审核详细
export function getRecord(id) {
  return request({
    url: '/system/record/' + id,
    method: 'get'
  })
}

// 新增借用审核
export function addRecord(data) {
  return request({
    url: '/system/record',
    method: 'post',
    data: data
  })
}

// 修改借用审核
export function updateRecord(data) {
  return request({
    url: '/system/record',
    method: 'put',
    data: data
  })
}

// 删除借用审核
export function delRecord(id) {
  return request({
    url: '/system/record/' + id,
    method: 'delete'
  })
}


//-------------------------------------------借用设备api
// 查询当前登录用户借的设备列表
export function getMyBorrowList(query) {
  return request({
    url: '/system/record/myborrowlist',
    method: 'get',
    params: query
  })
}
