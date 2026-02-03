import { Card, Statistic, Row, Col } from 'antd';
import { TableOutlined, ClusterOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { MatrixStats } from '../../types/matrix';

interface MatrixStatsProps {
  stats: MatrixStats;
}

export function MatrixStats({ stats }: MatrixStatsProps) {
  const completionRate =
    stats.totalCells > 0 ? Math.round((stats.configuredCells / stats.totalCells) * 100) : 0;

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="總餐桌數"
            value={stats.totalColumns}
            prefix={<TableOutlined />}
            valueStyle={{ fontSize: 20 }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="實際餐桌"
            value={stats.actualTables}
            valueStyle={{ color: '#1890ff', fontSize: 20 }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="虛擬併桌"
            value={stats.combinationTables}
            valueStyle={{ color: '#52c41a', fontSize: 20 }}
            prefix={<ClusterOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="已配置"
            value={`${stats.configuredCells}/${stats.totalCells}`}
            prefix={<CheckCircleOutlined />}
            valueStyle={{
              color: stats.configuredCells > 0 ? '#faad14' : '#999',
              fontSize: 16,
            }}
            suffix={
              <span style={{ fontSize: 14, color: '#999' }}>
                ({completionRate}%)
              </span>
            }
          />
        </Col>
      </Row>
    </Card>
  );
}
