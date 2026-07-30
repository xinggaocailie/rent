import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  FireOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Timeline,
  Typography,
  message
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { listHouses } from '../api/rentService';
import HouseCard from '../components/HouseCard';
import LoginRequired from '../components/LoginRequired';
import { useAuth } from '../contexts/AuthContext';
import type { House } from '../types/rent';

const { Paragraph, Text, Title } = Typography;

const hotTips = ['静安区', '浦东新区', '一居室', '地铁'];

function HomePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);
  const [glowPosition, setGlowPosition] = useState({ x: 70, y: 25 });

  const loadAvailableHouses = async () => {
    if (!isLoggedIn) {
      setHouses([]);
      return;
    }

    try {
      setLoading(true);
      const data = await listHouses({ status: 'available' });
      setHouses(data.list);
    } catch (error) {
      const msg = error instanceof Error ? error.message : '获取房源失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAvailableHouses();
  }, [isLoggedIn]);

  const filteredHouses = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) {
      return houses;
    }
    return houses.filter(
      (house) =>
        house.title.includes(kw) ||
        house.city.includes(kw) ||
        house.district.includes(kw) ||
        house.address.includes(kw)
    );
  }, [houses, keyword]);

  return (
    <Space direction="vertical" size={22} style={{ width: '100%' }}>
      <Card
        className="hero-card hero-surface"
        bordered={false}
        style={
          {
            '--mx': `${glowPosition.x}%`,
            '--my': `${glowPosition.y}%`
          } as CSSProperties
        }
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          setGlowPosition({ x, y });
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={15}>
            <Tag className="hero-tag">城市租房服务平台</Tag>
            <Title level={2} className="hero-title">
              找到适合你的安心住所
            </Title>
            <Paragraph className="hero-desc">
              与 rent-server 实时联动，房源状态秒级更新。支持快速搜索、详情查看与在线租赁，帮你把找房流程变得更简单。
            </Paragraph>
            <div className="search-box">
              <Input
                size="large"
                allowClear
                placeholder="请输入区域 / 标题 / 地址关键词"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onPressEnter={() => navigate(`/find?keyword=${encodeURIComponent(keyword.trim())}`)}
              />
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={() => navigate(`/find?keyword=${encodeURIComponent(keyword.trim())}`)}
              >
                开始找房
              </Button>
            </div>
            <Space wrap style={{ marginTop: 12 }}>
              {hotTips.map((tip) => (
                <Button key={tip} size="small" className="tip-btn" onClick={() => setKeyword(tip)}>
                  {tip}
                </Button>
              ))}
            </Space>
          </Col>
          <Col xs={24} lg={9}>
            <Card className="hero-side-card" bordered={false}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div className="hero-side-item">
                  <CompassOutlined className="hero-side-icon" />
                  <div>
                    <Text strong>精准推荐</Text>
                    <br />
                    <Text type="secondary">基于区域和关键词快速筛出目标房源</Text>
                  </div>
                </div>
                <div className="hero-side-item">
                  <SafetyCertificateOutlined className="hero-side-icon" />
                  <div>
                    <Text strong>状态真实</Text>
                    <br />
                    <Text type="secondary">已租/可租与后端状态保持一致</Text>
                  </div>
                </div>
                <div className="hero-side-item">
                  <ThunderboltOutlined className="hero-side-icon" />
                  <div>
                    <Text strong>流程高效</Text>
                    <br />
                    <Text type="secondary">从找房到提交租赁只需几个步骤</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={12} md={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic title="当前可租" value={houses.length} suffix="套" />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic title="实时联动" value="100%" />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic title="最快签约" value="当天" />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card className="metric-card" bordered={false}>
              <Statistic title="服务时间" value="7x24" />
            </Card>
          </Col>
        </Row>
      </Card>

      <Card
        className="section-card"
        bordered={false}
        title={
          <Space>
            <FireOutlined className="hot-icon" />
            <span>热门可租房源</span>
          </Space>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => void loadAvailableHouses()} loading={loading}>
            刷新
          </Button>
        }
      >
        {!isLoggedIn ? (
          <LoginRequired />
        ) : loading ? (
          <div className="center-box">
            <Spin />
          </div>
        ) : filteredHouses.length === 0 ? (
          <Empty description="暂无符合条件的房源" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, xl: 3 }}
            dataSource={filteredHouses.slice(0, 6)}
            renderItem={(house, index) => (
              <List.Item className="stagger-item" style={{ animationDelay: `${index * 80}ms` }}>
                <HouseCard house={house} />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="section-card" bordered={false} title="租房流程一目了然">
            <Timeline
              items={[
                {
                  dot: <CheckCircleOutlined className="timeline-dot" />,
                  children: 'Step 1：搜索并筛选房源（区域 / 预算 / 可租状态）'
                },
                {
                  dot: <CheckCircleOutlined className="timeline-dot" />,
                  children: 'Step 2：进入详情页确认面积、地址、描述等关键信息'
                },
                {
                  dot: <CheckCircleOutlined className="timeline-dot" />,
                  children: 'Step 3：选择租赁日期并提交，系统实时更新为“已出租”'
                }
              ]}
            />
            <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/find')}>
              前往找房页查看更多
            </Button>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="section-card" bordered={false} title="服务承诺">
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              <div className="info-item">
                <Title level={5}>真实房源</Title>
                <Paragraph type="secondary">所有列表数据来自实时接口，避免“看得到租不到”。</Paragraph>
              </div>
              <div className="info-item">
                <Title level={5}>流程清晰</Title>
                <Paragraph type="secondary">找房、看详情、提交租赁，链路简洁且可追踪。</Paragraph>
              </div>
              <div className="info-item">
                <Title level={5}>便于扩展</Title>
                <Paragraph type="secondary">已按模块拆分，可快速加地图、订单中心、收藏等功能。</Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

export default HomePage;
