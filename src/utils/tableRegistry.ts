

// 定义列配置类型
export interface ColumnConfig {
  prop: string;
  label: string;
  width?: number;
  formatter?: (row: any) => string;
  slot?: boolean;
  component?: string;
  tagType?: string;
  cellRenderer?: (row: any) => string;
}



// 定义表格配置类型
export interface TableConfig<T=any> {
  columns: ColumnConfig[];
  loadData: () => T[];
}

// 表格注册器
class TableRegistry {
  private tables: Map<string, TableConfig> = new Map();

  // 注册表格配置
  register(tableId: string, config: TableConfig): void {
    this.tables.set(tableId, config);
  }

  // 获取表格配置
  getTableConfig(tableId: string): TableConfig | undefined {
    return this.tables.get(tableId);
  }

  // 获取表格列配置
  getTableColumns(tableId: string): ColumnConfig[] {
    const config = this.tables.get(tableId);
    return config ? config.columns : [];
  }

  // 加载表格数据
  loadTableData(tableId: string): any[] {
    const config = this.tables.get(tableId);
    if (config) {
      return config.loadData();
    } else {
      console.warn(`未找到表格ID为 "${tableId}" 的配置`);
      return [];
    }
  }

  // 检查表格ID是否有效
  isValidTableId(tableId: string): boolean {
    return this.tables.has(tableId);
  }

  // 获取所有可用的表格ID
  getAvailableTableIds(): string[] {
    return Array.from(this.tables.keys());
  }
}

// 创建全局表格注册器实例
export const tableRegistry = new TableRegistry();

// 导出便捷方法
export const registerTable = <T=any>(tableId: string, config: TableConfig<T>) => tableRegistry.register(tableId, config);
export const getTableConfig = <T=any>(tableId: string) => tableRegistry.getTableConfig(tableId) as TableConfig<T>;
export const getTableColumns = <T=any>(tableId: string) => tableRegistry.getTableColumns(tableId) as ColumnConfig[];
export const loadTableData = <T=any>(tableId: string) => tableRegistry.loadTableData(tableId) as T[];
export const isValidTableId = <T=any>(tableId: string) => tableRegistry.isValidTableId(tableId);
export const getAvailableTableIds = <T=any>() => tableRegistry.getAvailableTableIds();

import ('./tables/stockTable.js')
