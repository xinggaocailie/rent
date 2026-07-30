import { useEffect, useMemo, useState } from 'react';
import { FilterOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Empty,
  Input,
  InputNumber,
  List,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message
} from 'antd';
import { useSearchParams } from 'react-router-dom';
import { listHouses } from '../api/rentService';
import HouseCard from '../components/HouseCard';
import LoginRequired from '../components/LoginRequired';
import { useAuth } from '../contexts/AuthContext';
import type { House } from '../types/rent';

const { Paragraph, Text, Title } = Typography;

function FindPage() {
  const { isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [minPrice, setMinPrice] = useState<number | null>(() => {
    const value = searchParams.get('minPrice');
    if (!value) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  });
  const [maxPrice, setMaxPrice] = useState<number | null>(() => {
    const value = searchParams.get('maxPrice');
    if (!value) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  });
  const [status, setStatus] = useState<'available' | 'rented' | ''>(
    (searchParams.get('status') as 'available' | 'rented' | '') || 'available'
  );
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);

  const loadHouses = async () => {
    if (!isLoggedIn) {
      setHouses([]);
      return;
    }

    try {
      setLoading(true);
      const data = await listHouses({ city: city || undefined, status: status || undefined });
      setHouses(data.list);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '获取房源失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHouses();
  }, [isLoggedIn, city, status]);

  const filteredHouses = useMemo(() => {
    const kw = keyword.trim();
    return houses.filter((house) => {
      const matchesKeyword =
        !kw ||
        house.title.includes(kw) ||
        house.city.includes(kw) ||
        house.district.includes(kw) ||
        house.address.includes(kw);
      const matchesMinPrice = minPrice === null || house.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || house.price <= maxPrice;
      return matchesKeyword && matchesMinPrice && matchesMaxPrice;
    });
  }, [houses, keyword, minPrice, maxPrice]);

  const updateSearch = () => {
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      message.warning('最低月租不能高于最高月租');
      return;
    }

    const next = new URLSearchParams();
    if (keyword.trim()) {
      next.set('keyword', keyword.trim());
    }
    if (city.trim()) {
      next.set('city', city.trim());
    }
    if (minPrice !== null) {
      next.set('minPrice', String(minPrice));
    }
    if (maxPrice !== null) {
      next.set('maxPrice', String(maxPrice));
    }
    if (status) {
      next.set('status', status);
    }
    setSearchParams(next);
    void loadHouses();
  };

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="section-card" bordered={false}>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Tag color="blue" className="hero-tag" style={{ width: 'fit-content' }}>
            智能筛选
          </Tag>
          <Title level={3} style={{ margin: 0 }}>
            找房中心
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 8 }}>
            支持按城市、状态与价格区间筛选，并根据关键词过滤标题、区域和地址。你可以组合条件快速定位目标房源。
          </Paragraph>
        </Space>
        <Space wrap style={{ width: '100%' }} size={[10, 10]}>
          <Input
            style={{ minWidth: 220 }}
            allowClear
            placeholder="关键词"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={updateSearch}
          />
          <Input
            style={{ minWidth: 180 }}
            allowClear
            placeholder="城市（如：上海）"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onPressEnter={updateSearch}
          />
          <InputNumber
            style={{ minWidth: 160 }}
            min={0}
            precision={0}
            placeholder="最低月租"
            value={minPrice}
            onChange={(value) => setMinPrice(typeof value === 'number' ? value : null)}
          />
          <InputNumber
            style={{ minWidth: 160 }}
            min={0}
            precision={0}
            placeholder="最高月租"
            value={maxPrice}
            onChange={(value) => setMaxPrice(typeof value === 'number' ? value : null)}
          />
          <Select
            style={{ minWidth: 160 }}
            value={status}
            onChange={(value) => setStatus(value)}
            options={[
              { label: '全部状态', value: '' },
              { label: '可租', value: 'available' },
              { label: '已出租', value: 'rented' }
            ]}
          />
          <Button type="primary" icon={<FilterOutlined />} onClick={updateSearch}>
            应用筛选
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => void loadHouses()} loading={loading}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card className="section-card" bordered={false}>
        <div className="list-head">
          <Text strong>房源列表</Text>
          <Text type="secondary">共 {filteredHouses.length} 套</Text>
        </div>
        {!isLoggedIn ? (
          <LoginRequired />
        ) : loading ? (
          <div className="center-box">
            <Spin />
          </div>
        ) : filteredHouses.length === 0 ? (
          <Empty description="没有找到符合条件的房源" />
        ) : (
          <List
            style={{ marginTop: 16 }}
            grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
            dataSource={filteredHouses}
            renderItem={(house, index) => (
              <List.Item className="stagger-item" style={{ animationDelay: `${index * 70}ms` }}>
                <HouseCard house={house} />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  );
}

export default FindPage;
