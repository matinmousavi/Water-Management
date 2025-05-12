// components/ContactInfoCard.jsx
import { Card, Col, Row, Typography, Button, Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styles from '../Profile.module.css';

const { Text } = Typography;

const contactInfo = [
  { label: 'نام و نام خانوادگی:', value: 'Matin Mousavi' },
  { label: 'ایمیل:', value: 'matinmousavi5049@gmail.com' },
  { label: 'موبایل:', value: '09158745049' },
  { label: 'تاریخ تولد:', value: '1377-03-15' },
];

const ContactInfoCard = () => (
  <Card className={styles.card}>
    <Flex align='center' justify='space-between'>
      <h2>اطلاعات تماس</h2>
      <Button type="default" shape="round" icon={<EditOutlined />} size='middle'>
        <span>ویرایش</span>
      </Button>
    </Flex>
    <div className={styles.infoWrapper}>
      <Row gutter={[0, 8]}>
        {contactInfo.map((item, index) => (
          <Col key={index} xs={24} md={16} lg={18} className={styles.line}>
            <Row>
              <Col xs={10}>
                <Text className={styles.text} strong>{item.label}</Text>
              </Col>
              <Col xs={14}>
                <Text className={styles.text}>{item.value}</Text>
              </Col>
            </Row>
          </Col>
        ))}
      </Row>
    </div>
  </Card>
);

export default ContactInfoCard;
