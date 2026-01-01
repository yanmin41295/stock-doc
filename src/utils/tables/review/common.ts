import {ColumnConfig} from "../../tableRegistry";

export interface Stock {
    id: number;
    code: string;
    name: string;
    operationType: string;
    quantity: number;
    price: number;
    profitLoss: number;
    remark: string;
}

export const stockColumns:ColumnConfig[] = [
    {prop: 'code', label: '股票代码', width: 100},
    {prop: 'name', label: '股票名称', width: 120},
    {prop: 'operationType', label: '操作类型', width: 120},
    {prop: 'quantity', label: '数量', width: 120},
    {prop: 'price', label: '价格', width: 120},
    {prop: 'profitLoss', label: '盈亏', width: 120},
    {prop: 'remark', label: '备注', width: 120},
]