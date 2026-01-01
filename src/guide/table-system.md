# 表格系统使用指南

## 概述

表格系统是一个可扩展的动态表格解决方案，支持通过表格ID获取表头、表格数据和配置。该系统采用注册模式，将每个表格的配置分离到单独的文件中，便于管理和扩展。

## 核心概念

### 表格注册器 (TableRegistry)
- 中心化的表格配置管理器
- 通过表格ID注册和查询表格配置
- 提供统一的接口来获取表头和数据

### 表格配置 (TableConfig)
每个表格配置包含：
- `columns`: 列配置数组
- `loadData`: 数据加载函数

## 使用方法

### 1. 注册新表格

创建一个新表格配置文件，例如 `src/utils/tables/myTable.ts`：

```typescript
import { registerTable } from '../tableRegistry';
import { DataGenerator } from '../dataGenerator';

// 定义数据接口
interface MyData {
  id: number;
  name: string;
  value: string;
}

// 注册表格
registerTable('myTable', {
  columns: [
    { prop: 'id', label: 'ID', width: 100 },
    { prop: 'name', label: '名称', width: 150 },
    { prop: 'value', label: '值', width: 200 },
  ],
  loadData: () => {
    // 返回表格数据
    return [
      { id: 1, name: '项目1', value: '值1' },
      { id: 2, name: '项目2', value: '值2' },
    ];
  }
});
```

### 2. 在组件中使用

在 Vue 组件中使用表格：

```vue
<template>
  <DataTable tableId="myTable" tableTitle="我的表格" />
</template>

<script setup>
// DataTable 组件会自动根据 tableId 获取对应的表格配置和数据
</script>
```

### 3. 在代码中获取表格信息

```typescript
import { getTableColumns, loadTableData, isValidTableId } from '../utils/tableDataManager';

// 检查表格ID是否有效
if (isValidTableId('myTable')) {
  // 获取列配置
  const columns = getTableColumns('myTable');
  
  // 加载表格数据
  const data = loadTableData('myTable');
}
```

## 系统架构

```
tableRegistry.ts     # 表格注册器和核心管理逻辑
├── tableDataManager.ts  # 统一的表格数据管理接口
├── tableImports.ts      # 集中导入所有表格配置
├── tables/              # 各个表格配置文件目录
│   ├── stockTable.ts    # 股票表格配置
│   └── ...
└── DataTable.vue        # 表格展示组件
```

## 扩展示例

### 股票表格配置示例

查看 `src/utils/tables/stockTable.ts` 文件，其中包含了复杂的表格配置，包括：

- 格式化函数 (formatter)
- 插槽列 (slot)
- 动态标签类型 (tagType)

## 扩展说明

1. **每个表格一个文件**: 将每个表格的配置放在 `src/utils/tables/` 目录下的单独文件中
2. **统一注册**: 所有表格配置文件都会在 `tableImports.ts` 中导入
3. **便捷访问**: 通过统一的接口函数获取表格信息
4. **类型安全**: TypeScript 接口确保类型安全

## 已注册的表格

- `employee`: 员工信息表格
- `product`: 产品信息表格
- `custom`: 自定义表格
- `stock`: 股票信息表格

## API 参考

### 导出函数

- `registerTable(tableId, config)`: 注册表格配置
- `getTableConfig(tableId)`: 获取表格配置
- `getTableColumns(tableId)`: 获取表格列配置
- `loadTableData(tableId)`: 加载表格数据
- `isValidTableId(tableId)`: 检查表格ID是否有效
- `getAvailableTableIds()`: 获取所有可用表格ID