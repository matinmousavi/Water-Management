import { Flex, Card, Typography, Input, Button, Row, Col } from 'antd'
import BreadCrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import styles from './NotificationSettings.module.css'

const { Title, Text } = Typography
const { TextArea } = Input

const NotificationSettings = () => {
	return (
		<Flex vertical gap={32}>
			<BreadCrumbs />
			<Flex vertical gap={16}>
				<Card>
					<Flex vertical gap={16}>
						<Title level={2} className='text-h2'>
							اطلاع رسانی OTP
						</Title>
						<Text>پیامک حاوی کد تأیید هنگام ورود کاربر به سیستم ارسال می‌شود.</Text>
						<TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
						<Flex justify='end'>
							<Button type='primary'>ذخیره</Button>
						</Flex>
					</Flex>
				</Card>
				<Card>
					<Flex vertical gap={20}>
						<Title level={2} className='text-h2'>
							اطلاع رسانی آبرسانی
						</Title>
						<Text>پیامک حاوی اطلاعات آبرسانی به میرآب و مالک زمین ارسال می‌شود.</Text>
						<Flex vertical gap={16}>
							<Row gutter={16}>
								<Col span={12}>
									<Flex gap={8} vertical>
										<Text>شروع آبرسانی برای میرآب</Text>
										<TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
									</Flex>
								</Col>
								<Col span={12}>
									<Flex gap={8} vertical>
										<Text>پایان آبرسانی برای میرآب</Text>
										<TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
									</Flex>
								</Col>
							</Row>
							<Flex justify='end'>
								<Button type='primary'>ذخیره</Button>
							</Flex>
						</Flex>
						<div className={styles.line}></div>
						<Flex vertical gap={16}>
							<Row gutter={16}>
								<Col span={12}>
									<Flex gap={8} vertical>
										<Text>شروع آبرسانی برای مالک زمین</Text>
										<TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
									</Flex>
								</Col>
								<Col span={12}>
									<Flex gap={8} vertical>
										<Text>پایان آبرسانی برای مالک زمین</Text>
										<TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
									</Flex>
								</Col>
							</Row>
							<Flex justify='end'>
								<Button type='primary'>ذخیره</Button>
							</Flex>
						</Flex>
					</Flex>
				</Card>
			</Flex>
		</Flex>
	)
}

export default NotificationSettings
