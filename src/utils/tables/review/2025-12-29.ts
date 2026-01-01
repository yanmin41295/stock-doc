import {registerTable} from '../../tableRegistry.js';
import {Stock, stockColumns} from "./common";

// 注册股票表格
registerTable<Stock>('stock', {
    columns: stockColumns  ,
    loadData: () => {
        return [{
            id: 1,
            code: '000001',
            name: '股票1',
            operationType: '购买',
            quantity: 100,
            price: 100,
            profitLoss: 1000,
            remark: '备注1',
        }]
    }
});