import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Card, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import type { House } from '../types/rent';

const { Paragraph, Text, Title } = Typography;

interface HouseCardProps {
  house: House;
  showActions?: boolean;
}

function HouseCard({ house, showActions = true }: HouseCardProps) {
  const isRented = house.status === 'rented';

  return (
    <Card
      className="house-card"
      hoverable
      actions={
        showActions
          ? [
              <Link to={`/houses/${house.id}`} key="detail">
                查看详情
              </Link>
            ]
          : undefined
      }
    >
      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        <Space align="center" wrap>
          <Tag color={isRented ? 'default' : 'success'}>{isRented ? '已出租' : '可租'}</Tag>
          <Text type="secondary">{house.city}</Text>
          <Text type="secondary">{house.district}</Text>
        </Space>

        <Title level={5} style={{ margin: 0 }}>
          {house.title}
        </Title>

        <Space size={6}>
          <EnvironmentOutlined />
          <Text>{house.address}</Text>
        </Space>

        <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
          {house.description || '暂无描述'}
        </Paragraph>

        <div className="house-meta-row">
          <Space align="baseline" wrap>
            <Text className="house-price">¥{house.price}</Text>
            <Text type="secondary">/ 月</Text>
            <Text type="secondary">{house.area}m²</Text>
          </Space>
        </div>

        {!showActions && (
          <Link to={`/houses/${house.id}`}>
            <Button type="link" style={{ padding: 0 }}>
              查看详情
            </Button>
          </Link>
        )}
      </Space>
    </Card>
  );
}

export default HouseCard;
