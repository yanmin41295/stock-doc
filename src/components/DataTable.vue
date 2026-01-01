<template>
  <div class="data-table-container">
    <div class="table-header">
      <div class="table-title">{{ tableTitle }}</div>
      <el-dropdown class="column-settings-dropdown" @command="handleColumnSettings">
        <el-button size="small" circle>
          <el-icon>
            <Setting/>
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="columnManager">
              <el-icon>
                <Tickets/>
              </el-icon>
              列管理
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-table :data="tableState.tableData" style="width: 100%" :stripe="true" :border="true" :height="tableHeight"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold', padding: '0' }"
              :cell-style="{ padding: '6px 0' }" @header-dragend="handleHeaderDragend" table-layout="fixed" :fit="true">
      <el-table-column
          v-for="(column, index) in tableState.visibleColumns" :key="column.prop" :prop="column.prop"
          :label="column.label" :width="getColumnWidth(column)" :min-width="column.minWidth || 100"
          :formatter="column.formatter" :align="column.align || 'left'" :show-overflow-tooltip="true">
        <template v-if="column.slot" #default="scope">
          <component
              :is="column.component"
              :type="column.tagType ? getTagType(scope.row[column.prop], scope.row, column.tagType) : ''"
              :style="column.tagType ? getTagStyle(scope.row[column.prop], scope.row, column.tagType) : ''"
          >
            {{ column.cellRenderer ? column.cellRenderer(scope.row) : scope.row[column.prop] }}
          </component>
        </template>
      </el-table-column>
    </el-table>

    <!-- 列管理对话框 -->
    <el-dialog v-model="showColumnManager" title="列管理" width="500px">
      <div class="column-manager">
        <div class="column-list">
          <draggable
              v-model="tableState.draggableColumns"
              item-key="prop"
              @end="onColumnOrderChange"
              :animation="200"
              handle=".drag-handle"
              class="draggable-list"
          >
            <template #item="{ element }">
              <div class="column-item">
                <el-icon class="drag-handle" style="cursor: move; margin-right: 8px;">
                  <Rank/>
                </el-icon>
                <div style="flex: 1;">
                  <el-checkbox v-model="element.visible" @change="onColumnVisibilityChange"> {{ element.label }}
                  </el-checkbox>
                  <div class="width-control">
                    <span style="font-size: 12px; color: #909399; margin-right: 8px;">宽度:</span>
                    <el-input-number v-model="element.currentWidth" :min="50" :max="500" :step="10" size="small"
                                     style="width: 100px;" @change="onColumnWidthChange"/>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetToDefault">恢复默认</el-button>
          <el-button @click="showColumnManager = false">取消</el-button>
          <el-button type="primary" @click="saveColumnSettings">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <div class="controls" v-if="showControls">
      <el-button @click="loadData" type="primary" style="margin: 10px 0;">刷新数据</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, onMounted, ref, nextTick} from 'vue';
import {
  ElTable,
  ElTableColumn,
  ElTag,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElIcon,
  ElDialog,
  ElCheckbox,
  ElMessage,
  ElInputNumber
} from 'element-plus';
import {Setting, Tickets, Rank} from '@element-plus/icons-vue';
import draggable from 'vuedraggable';
import {getTableColumns, loadTableData, isValidTableId} from '../utils/tableRegistry';

// 定义组件props
interface Props {
  tableId: string;
  tableHeight?: number;
  showControls?: boolean;
  tableTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tableHeight: 500,
  showControls: true,
  tableTitle: '数据表格',
});

// 使用reactive定义响应式状态
const tableState = reactive({
  tableData: [] as any[],
  tableColumns: [] as any[],
  visibleColumns: [] as any[],
  draggableColumns: [] as any[],
});

const showColumnManager = ref(false);

// 计算列宽的函数，如果没有设置宽度则自动分配
const getColumnWidth = (column: any) => {
  // 如果设置了currentWidth，则使用它
  if (column.currentWidth && column.currentWidth > 0) {
    return column.currentWidth;
  }
  // 如果设置了原始宽度，则使用它
  if (column.width && column.width > 0) {
    return column.width;
  }
  // 否则返回undefined，让Element Plus自动分配宽度
  return undefined;
};

// 处理表头拖拽结束事件（调整列宽）
const handleHeaderDragend = (newWidth: number, oldWidth: number, column: any) => {
  // 查找对应的列配置并更新宽度
  const colConfig = tableState.draggableColumns.find(col => col.prop === column.property);
  if (colConfig) {
    colConfig.currentWidth = newWidth;
    // 更新可见列
    updateVisibleColumns();
    // 自动保存到localStorage
    saveCurrentSettings();
  }
};

// 保存当前设置到localStorage
const saveCurrentSettings = () => {
  const settings = {
    columns: tableState.draggableColumns.map(col => ({
      prop: col.prop,
      visible: col.visible,
      currentWidth: col.currentWidth
    })),
    order: tableState.draggableColumns.map(col => col.prop)
  };

  const storageKey = getStorageKey(props.tableId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch (e) {
    console.error('保存列设置失败:', e);
  }
};

// 生成存储键名
const getStorageKey = (tableId: string) => `table_column_settings_${tableId}`;

// 从localStorage加载列设置
const loadColumnSettings = () => {
  const storageKey = getStorageKey(props.tableId);
  const savedSettings = localStorage.getItem(storageKey);

  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      return settings;
    } catch (e) {
      console.error('加载列设置失败:', e);
      return null;
    }
  }
  return null;
};

// 保存列设置到localStorage
const saveColumnSettingsToStorage = (settings: any) => {
  const storageKey = getStorageKey(props.tableId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch (e) {
    console.error('保存列设置失败:', e);
  }
};

// 恢复默认设置
const resetToDefault = () => {
  if (tableState.tableColumns.length > 0) {
    tableState.draggableColumns = tableState.tableColumns.map(col => ({
      ...col,
      visible: true,
      currentWidth: col.width || undefined  // 重置为默认宽度
    }));
    updateVisibleColumns();
    saveCurrentSettings(); // 保存默认设置
    ElMessage.info('已恢复默认设置');
  }
};

// 根据表格ID加载数据
const loadData = () => {
  if (!isValidTableId(props.tableId)) {
    console.warn(`未找到表格ID为 "${props.tableId}" 的配置`);
    tableState.tableData = [];
    tableState.tableColumns = [];
    tableState.visibleColumns = [];
    return;
  }

  const originalColumns = getTableColumns(props.tableId);
  tableState.tableColumns = originalColumns;

  // 初始化可拖拽列配置
  let savedSettings = loadColumnSettings();

  if (savedSettings && savedSettings.columns) {
    // 使用保存的设置，但确保所有原始列都存在
    const savedColumnMap = new Map(savedSettings.columns.map((col: any) => [col.prop, col]));

    tableState.draggableColumns = originalColumns.map(col => {
      const savedCol = savedColumnMap.get(col.prop);
      return {
        ...col,
        visible: savedCol ? savedCol.visible : true,
        currentWidth: savedCol && savedCol.currentWidth ? savedCol.currentWidth : col.width
      };
    });

    // 按保存的顺序排序
    if (savedSettings.order) {
      tableState.draggableColumns.sort((a, b) => {
        const aIndex = savedSettings.order.indexOf(a.prop);
        const bIndex = savedSettings.order.indexOf(b.prop);
        return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
      });
    }
  } else {
    // 默认设置：所有列都可见，使用原始宽度
    tableState.draggableColumns = originalColumns.map(col => ({
      ...col,
      visible: true,
      currentWidth: col.width
    }));
  }

  // 初始化显示的列
  updateVisibleColumns();

  tableState.tableData = loadTableData(props.tableId);
};

// 更新可见列
const updateVisibleColumns = () => {
  tableState.visibleColumns = tableState.draggableColumns
      .filter(col => col.visible)
      .map(col => col);
};

// 处理菜单命令
const handleColumnSettings = (command: string) => {
  if (command === 'columnManager') {
    showColumnManager.value = true;
  }
};

// 列顺序改变事件
const onColumnOrderChange = () => {
  updateVisibleColumns();
};

// 列可见性改变事件
const onColumnVisibilityChange = () => {
  updateVisibleColumns();
};

// 列宽度改变事件
const onColumnWidthChange = () => {
  updateVisibleColumns();
  // 自动保存到localStorage
  saveCurrentSettings();
};

// 保存列设置
const saveColumnSettings = () => {
  updateVisibleColumns();

  // 保存设置到localStorage
  const settings = {
    columns: tableState.draggableColumns.map(col => ({
      prop: col.prop,
      visible: col.visible,
      currentWidth: col.currentWidth
    })),
    order: tableState.draggableColumns.map(col => col.prop)
  };

  saveColumnSettingsToStorage(settings);

  showColumnManager.value = false;
  ElMessage.success('列设置已保存');
};

// 根据数据值获取标签类型
const getTagType = (value: any, row: any, type: string): string => {
  if (type === 'status') {
    return value === 'Active' ? 'success' : 'danger';
  } else if (type === 'inStock') {
    return value ? 'success' : 'danger';
  }
  return 'info';
};

// 根据数据值获取标签样式
const getTagStyle = (value: any, row: any, type: string): any => {
  if (type === 'status') {
    return value === 'Active'
        ? {background: '#f0f9ec', color: '#67c23a', border: '1px solid #e0f3e0'}
        : {background: '#fef0f0', color: '#f56c6c', border: '1px solid #fae2e2'};
  } else if (type === 'inStock') {
    return value
        ? {background: '#f0f9ec', color: '#67c23a', border: '1px solid #e0f3e0'}
        : {background: '#fef0f0', color: '#f56c6c', border: '1px solid #fae2e2'};
  }
  return {background: '#f4f4f5', color: '#909399', border: '1px solid #e9e9eb'};
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.data-table-container {
  padding: 20px;
  margin: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.data-table-container:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.column-settings-dropdown {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 10;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  table-layout: fixed;
  width: 100% !important;
}

:deep(.el-table__header) {
  border-radius: 8px 8px 0 0;
}

:deep(.el-table__body-wrapper) {
  border-radius: 0 0 8px 8px;
}

:deep(.el-table th),
:deep(.el-table td) {
  border-color: #ebeef5;
  padding: 6px 0 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  padding: 0 !important;
}

:deep(.el-table .el-table__row) {
  margin: 0;
  padding: 0;
}

:deep(.el-table tr) {
  transition: all 0.3s ease;
}

:deep(.el-table .el-table__row:hover) {
  background-color: #f5f7fa;
  transform: scale(1.01);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  position: relative;
}

:deep(.el-table .el-table__header-wrapper),
:deep(.el-table .el-table__body-wrapper) {
  margin: 0;
  padding: 0;
}

:deep(.el-table .el-table__header-wrapper table),
:deep(.el-table .el-table__body-wrapper table) {
  margin: 0;
  padding: 0;
  width: 100% !important;
}

:deep(.el-table th > .cell) {
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table .el-table__empty-block) {
  width: 100% !important;
}

.controls {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-button) {
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.column-manager {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.column-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.column-item:hover {
  background-color: #f2f6fc;
  border-color: #c0c4cc;
}

.draggable-list {
  min-height: 60px;
}

.draggable-list .column-item {
  cursor: move;
}

.width-control {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>