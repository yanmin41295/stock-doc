---
title: 数据表格示例
---

# 数据表格示例

这是一个使用Element Plus的表格组件示例，数据和列配置通过TypeScript方法生成。

## 员工表格

<DataTable tableId="employee" />

## 产品表格

<DataTable tableId="product" tableHeight="400" />

## 自定义表格

<DataTable tableId="custom" tableHeight="300" />

## 说明

这个表格组件展示了：

- 使用Element Plus的表格组件
- 通过表格ID动态加载列配置和数据
- 包含员工数据、产品数据和自定义数据三种类型
- 可以通过tableId属性指定要显示的表格类型
- 可以通过tableHeight属性设置表格高度
- 格式化的数据显示（薪资、价格等）
- 状态标签显示（使用el-tag组件）