import React, { useState, useCallback } from 'react';
import { Card, Button, Input, Select, DatePicker, Table, Space, Statistic, Row, Col, Loading, Message } from '@deriv-com/ui';
import { localize } from '@deriv-com/translations';
import './analysis-tool.scss';

interface AnalysisData {
    id: string;
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    profit: number;
    profitPercentage: number;
    duration: number;
    date: string;
    type: 'buy' | 'sell';
    status: 'won' | 'lost' | 'pending';
}

interface AnalysisMetrics {
    totalTrades: number;
    winRate: number;
    totalProfit: number;
    averageProfit: number;
    maxProfit: number;
    maxLoss: number;
    bestTrade: AnalysisData | null;
    worstTrade: AnalysisData | null;
}

const AnalysisTool: React.FC = () => {
    const [trades, setTrades] = useState<AnalysisData[]>([]);
    const [filteredTrades, setFilteredTrades] = useState<AnalysisData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterSymbol, setFilterSymbol] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);

    const calculateMetrics = useCallback((tradesList: AnalysisData[]): AnalysisMetrics => {
        if (tradesList.length === 0) {
            return {
                totalTrades: 0,
                winRate: 0,
                totalProfit: 0,
                averageProfit: 0,
                maxProfit: 0,
                maxLoss: 0,
                bestTrade: null,
                worstTrade: null,
            };
        }

        const wonTrades = tradesList.filter(t => t.status === 'won');
        const winRate = (wonTrades.length / tradesList.length) * 100;
        const totalProfit = tradesList.reduce((sum, trade) => sum + trade.profit, 0);
        const averageProfit = totalProfit / tradesList.length;
        const profits = tradesList.map(t => t.profit);
        const maxProfit = Math.max(...profits);
        const maxLoss = Math.min(...profits);
        const bestTrade = tradesList.reduce((best, current) =>
            current.profit > (best?.profit || -Infinity) ? current : best
        );
        const worstTrade = tradesList.reduce((worst, current) =>
            current.profit < (worst?.profit || Infinity) ? current : worst
        );

        return {
            totalTrades: tradesList.length,
            winRate: parseFloat(winRate.toFixed(2)),
            totalProfit: parseFloat(totalProfit.toFixed(2)),
            averageProfit: parseFloat(averageProfit.toFixed(2)),
            maxProfit: parseFloat(maxProfit.toFixed(2)),
            maxLoss: parseFloat(maxLoss.toFixed(2)),
            bestTrade,
            worstTrade,
        };
    }, []);

    const applyFilters = useCallback(() => {
        let filtered = [...trades];

        if (filterSymbol) {
            filtered = filtered.filter(trade => trade.symbol === filterSymbol);
        }

        if (filterStatus) {
            filtered = filtered.filter(trade => trade.status === filterStatus);
        }

        if (startDate) {
            const start = new Date(startDate);
            filtered = filtered.filter(trade => new Date(trade.date) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            filtered = filtered.filter(trade => new Date(trade.date) <= end);
        }

        setFilteredTrades(filtered);
        setMetrics(calculateMetrics(filtered));
    }, [trades, filterSymbol, filterStatus, startDate, endDate, calculateMetrics]);

    const loadSampleData = useCallback(async () => {
        setIsLoading(true);
        try {
            const sampleTrades: AnalysisData[] = [
                {
                    id: '1',
                    symbol: 'EUR/USD',
                    entryPrice: 1.0850,
                    exitPrice: 1.0920,
                    quantity: 100000,
                    profit: 700,
                    profitPercentage: 0.64,
                    duration: 45,
                    date: new Date().toISOString(),
                    type: 'buy',
                    status: 'won',
                },
                {
                    id: '2',
                    symbol: 'GBP/USD',
                    entryPrice: 1.2750,
                    exitPrice: 1.2680,
                    quantity: 50000,
                    profit: -350,
                    profitPercentage: -0.55,
                    duration: 30,
                    date: new Date(Date.now() - 86400000).toISOString(),
                    type: 'sell',
                    status: 'lost',
                },
                {
                    id: '3',
                    symbol: 'USD/JPY',
                    entryPrice: 110.50,
                    exitPrice: 111.25,
                    quantity: 1000,
                    profit: 750,
                    profitPercentage: 0.68,
                    duration: 60,
                    date: new Date(Date.now() - 172800000).toISOString(),
                    type: 'buy',
                    status: 'won',
                },
            ];

            setTrades(sampleTrades);
            setFilteredTrades(sampleTrades);
            setMetrics(calculateMetrics(sampleTrades));
            Message.success(localize('Sample data loaded'));
        } catch (error) {
            console.error('Error loading data:', error);
            Message.error(localize('Failed to load analysis data'));
        } finally {
            setIsLoading(false);
        }
    }, [calculateMetrics]);

    const columns = [
        {
            title: localize('Symbol'),
            dataIndex: 'symbol',
            key: 'symbol',
        },
        {
            title: localize('Type'),
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => type.toUpperCase(),
        },
        {
            title: localize('Entry Price'),
            dataIndex: 'entryPrice',
            key: 'entryPrice',
            render: (price: number) => price.toFixed(4),
        },
        {
            title: localize('Exit Price'),
            dataIndex: 'exitPrice',
            key: 'exitPrice',
            render: (price: number) => price.toFixed(4),
        },
        {
            title: localize('Profit/Loss'),
            dataIndex: 'profit',
            key: 'profit',
            render: (profit: number) => (
                <span className={profit >= 0 ? 'profit-positive' : 'profit-negative'}>
                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                </span>
            ),
        },
        {
            title: localize('Return %'),
            dataIndex: 'profitPercentage',
            key: 'profitPercentage',
            render: (percentage: number) => (
                <span className={percentage >= 0 ? 'profit-positive' : 'profit-negative'}>
                    {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                </span>
            ),
        },
        {
            title: localize('Status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span className={`status-${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            ),
        },
    ];

    return (
        <div className='analysis-tool'>
            <Card title={localize('Trade Analysis Tool')} className='analysis-card'>
                {metrics && (
                    <Row gutter={[16, 16]} className='metrics-row'>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={localize('Total Trades')}
                                value={metrics.totalTrades}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={localize('Win Rate')}
                                value={metrics.winRate}
                                suffix='%'
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={localize('Total Profit')}
                                value={metrics.totalProfit}
                                prefix='$'
                                valueStyle={{ color: metrics.totalProfit >= 0 ? '#52c41a' : '#ff4d4f' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={localize('Average Profit')}
                                value={metrics.averageProfit}
                                prefix='$'
                                valueStyle={{ color: metrics.averageProfit >= 0 ? '#52c41a' : '#ff4d4f' }}
                            />
                        </Col>
                    </Row>
                )}

                <Space direction='vertical' style={{ width: '100%', marginBottom: '20px' }} size='large'>
                    <div className='filters-section'>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    label={localize('Symbol')}
                                    value={filterSymbol}
                                    onChange={(e) => setFilterSymbol(e.target.value)}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    label={localize('Status')}
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
                            <Col>
                                <Button onClick={applyFilters} primary>
                                    {localize('Apply Filters')}
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    onClick={() => {
                                        setFilterSymbol('');
                                        setFilterStatus('');
                                        setStartDate('');
                                        setEndDate('');
                                        setFilteredTrades(trades);
                                        setMetrics(calculateMetrics(trades));
                                    }}
                                >
                                    {localize('Reset')}
                                </Button>
                            </Col>
                            <Col>
                                <Button onClick={loadSampleData} secondary loading={isLoading}>
                                    {localize('Load Sample Data')}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Space>

                <Loading loading={isLoading}>
                    <Table
                        columns={columns}
                        dataSource={filteredTrades}
                        rowKey='id'
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => localize(`Total ${total} trades`),
                        }}
                        className='trades-table'
                    />
                </Loading>
            </Card>
        </div>
    );
};

export default AnalysisTool;
