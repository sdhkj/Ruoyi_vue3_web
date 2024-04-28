import request from '@/utils/request'

// 查询设备详细信息列表
export function listDetail(query) {
  return request({
    url: '/detail/detail/list',
    method: 'get',
    params: query
  })
}

// 查询设备详细信息详细
export function getDetail(id) {
  return request({
    url: '/detail/detail/' + id,
    method: 'get'
  })
}

// 新增设备详细信息
export function addDetail(data) {
  return request({
    url: '/detail/detail',
    method: 'post',
    data: data
  })
}

// 修改设备详细信息
export function updateDetail(data) {
  return request({
    url: '/detail/detail',
    method: 'put',
    data: data
  })
}

// 删除设备详细信息
export function delDetail(id) {
  return request({
    url: '/detail/detail/' + id,
    method: 'delete'
  })
}

// 学生点击借用设备
export function addBorrowRecord(data) {
  return request({
    url: '/system/record/addrecord',
    method: 'post',
    data: data
  })
}
