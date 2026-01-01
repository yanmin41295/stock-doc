import {registerTable} from '../tableRegistry.js';

// 定义股票数据接口
export interface Stock {
    id: number;
    code: string;
    name: string;
    currentPrice: number;
    changeAmount: number;
    changePercent: number;
    volume: number;
    turnover: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    preClose: number;
    status: '正常' | '停牌' | '涨停' | '跌停';
    market: string;
    industry: string;
    peRatio: number;
    pbRatio: number;
}

// 生成股票数据
const generateStockData = (count: number): Stock[] => {
    const markets = ['上证A股', '深证A股', '创业板', '科创板'];
    const industries = ['科技', '金融', '医药', '消费', '制造', '能源', '房地产'];
    const statusOptions: Array<'正常' | '停牌' | '涨停' | '跌停'> = ['正常', '停牌', '涨停', '跌停'];

    const data: Stock[] = [];

    for (let i = 1; i <= count; i++) {
        const preClose = 10 + Math.random() * 30; // 前收盘价 10-40
        const changePercent = (Math.random() - 0.5) * 0.2; // -10% 到 +10%
        const currentPrice = preClose * (1 + changePercent);
        const changeAmount = currentPrice - preClose;

        data.push({
            id: i,
            code: `000${i.toString().padStart(3, '0')}`,
            name: `股票${i}`,
            currentPrice: parseFloat(currentPrice.toFixed(2)),
            changeAmount: parseFloat(changeAmount.toFixed(2)),
            changePercent: parseFloat((changePercent * 100).toFixed(2)),
            volume: Math.floor(Math.random() * 10000000) + 100000, // 10万-1000万股
            turnover: Math.floor(Math.random() * 100000000) + 1000000, // 100万-1亿成交额
            openPrice: parseFloat((preClose * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)), // 开盘价
            highPrice: parseFloat(Math.max(currentPrice, preClose * (1 + Math.random() * 0.05)).toFixed(2)), // 最高价
            lowPrice: parseFloat(Math.min(currentPrice, preClose * (1 - Math.random() * 0.05)).toFixed(2)), // 最低价
            preClose: parseFloat(preClose.toFixed(2)),
            status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
            market: markets[Math.floor(Math.random() * markets.length)],
            industry: industries[Math.floor(Math.random() * industries.length)],
            peRatio: parseFloat((Math.random() * 50 + 5).toFixed(2)), // 市盈率 5-55
            pbRatio: parseFloat((Math.random() * 5 + 0.5).toFixed(2)), // 市净率 0.5-5.5
        });
    }

    return data;
};

// 注册股票表格
registerTable('stock', {
    columns: [
        {prop: 'code', label: '代码', width: 100},
        {prop: 'name', label: '名称', width: 120},
        {
            prop: 'currentPrice',
            label: '当前价',
            width: 100,
            formatter: (row: Stock) => `¥${row.currentPrice.toFixed(2)}`
        },
        {
            prop: 'changeAmount',
            label: '涨跌额',
            width: 100,
            formatter: (row: Stock) => {
                const prefix = row.changeAmount >= 0 ? '+' : '';
                return `${prefix}${row.changeAmount.toFixed(2)}`;
            }
        },
        {
            prop: 'changePercent',
            label: '涨跌幅(%)',
            width: 120,
            formatter: (row: Stock) => {
                const prefix = row.changePercent >= 0 ? '+' : '';
                return `${prefix}${row.changePercent.toFixed(2)}%`;
            }
        },
        {
            prop: 'volume',
            label: '成交量(股)',
            width: 120,
            formatter: (row: Stock) => `${(row.volume / 10000).toFixed(2)}万`
        },
        {
            prop: 'turnover',
            label: '成交额(元)',
            width: 120,
            formatter: (row: Stock) => `¥${(row.turnover / 10000).toFixed(2)}万`
        },
        {prop: 'openPrice', label: '开盘价', width: 100},
        {prop: 'highPrice', label: '最高价', width: 100},
        {prop: 'lowPrice', label: '最低价', width: 100},
        {prop: 'market', label: '市场', width: 100},
        {prop: 'industry', label: '行业', width: 120},
        {
            prop: 'peRatio',
            label: '市盈率',
            width: 100,
            formatter: (row: Stock) => row.peRatio.toFixed(2)
        },
        {
            prop: 'pbRatio',
            label: '市净率',
            width: 100,
            formatter: (row: Stock) => row.pbRatio.toFixed(2)
        },
        {
            prop: 'status',
            label: '状态',
            width: 100,
            slot: true,
            component: 'ElTag',
            tagType: 'status',
            cellRenderer: (row: Stock) => row.status,
        },
    ],
    loadData: () => generateStockData(50)
});