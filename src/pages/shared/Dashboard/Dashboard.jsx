import { Card, Typography, Flex, Table, Tag, Input, Row, Col } from 'antd'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import styles from './Dashboard.module.css'

const { Title, Text } = Typography

const Dashboard = () => {
	const [searchedColumn, setSearchedColumn] = useState('')

	const tableData = [
		{ key: '1', name: 'نام چاه A', family: 'میرآب 1', count: 5, status: 'active' },
		{ key: '2', name: 'نام چاه B', family: 'میرآب 2', count: 5, status: 'inactive' },
		{ key: '3', name: 'نام چاه A', family: 'میرآب 2', count: 5, status: 'active' },
		{ key: '4', name: 'نام چاه C', family: 'میرآب 3', count: 5, status: 'active' },
		{ key: '5', name: 'نام چاه D', family: 'میرآب 1', count: 5, status: 'inactive' },
		{ key: '6', name: 'نام چاه E', family: 'میرآب 4', count: 5, status: 'inactive' },
		{ key: '7', name: 'نام چاه F', family: 'میرآب 5', count: 5, status: 'inactive' },
		{ key: '8', name: 'نام چاه G', family: 'میرآب 1', count: 5, status: 'active' },
		{ key: '9', name: 'نام چاه H', family: 'میرآب 2', count: 5, status: 'active' },
		{ key: '10', name: 'نام چاه I', family: 'میرآب 3', count: 5, status: 'active' },
		{ key: '11', name: 'نام چاه J', family: 'میرآب 4', count: 5, status: 'inactive' },
		{ key: '12', name: 'نام چاه K', family: 'میرآب 5', count: 5, status: 'active' },
	]

	const getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div className={styles.filterDropdown}>
				<Input
					placeholder={`جستجو ${dataIndex === 'name' ? 'عنوان چاه' : 'میرآب'}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => {
						confirm()
						setSearchedColumn(dataIndex)
					}}
					className={styles.searchInput}
				/>
				<div className={styles.filterActions}>
					<a
						onClick={() => {
							confirm()
							setSearchedColumn(dataIndex)
						}}
					>
						اعمال
					</a>
					<a
						onClick={() => {
							clearFilters()
							confirm()
						}}
					>
						پاک‌سازی
					</a>
				</div>
			</div>
		),
		onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
	})

	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'name',
			key: 'name',
			render: name => <Link>{name}</Link>,
			...getColumnSearchProps('name'),
		},
		{
			title: 'میرآب',
			dataIndex: 'family',
			key: 'family',
			render: text => <Link>{text}</Link>,
			...getColumnSearchProps('family'),
		},
		{
			title: 'تعداد زمین ها',
			dataIndex: 'count',
			key: 'count',
		},
		{
			title: 'وضعیت',
			dataIndex: 'status',
			key: 'status',
			filters: [
				{ text: 'فعال', value: 'active' },
				{ text: 'غیرفعال', value: 'inactive' },
			],
			onFilter: (value, record) => record.status === value,
			render: status => (
				<Tag className={styles.tag} color={status === 'active' ? 'green' : 'red'}>
					{status === 'active' ? 'فعال' : 'غیرفعال'}
				</Tag>
			),
		},
	]

	return (
		<Flex vertical gap={40}>
			<Flex vertical gap={24}>
				<Title level={1} className={`text-h1 ${styles.title}`}>
					داشبورد
				</Title>

				<Flex align='stretch' justify='space-between' gap={16} wrap>
					<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
						<Col xs={24} sm={12} md={8}>
							<Card className={styles.card}>
								<Flex vertical align='center' justify='center' gap={8}>
									<Text>
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه
										روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با
										نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.
									</Text>
								</Flex>
							</Card>
						</Col>

						<Col xs={24} sm={12} md={8}>
							<Card className={styles.card}>
								<Flex vertical align='center' justify='center' gap={8}>
									<Text>
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه
										روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با
										نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.
									</Text>
								</Flex>
							</Card>
						</Col>

						<Col xs={24} sm={12} md={8}>
							<Card className={styles.card}>
								<Flex vertical align='center' justify='center' gap={8}>
									<Text>
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه
										روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با
										نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.
									</Text>
								</Flex>
							</Card>
						</Col>
					</Row>
				</Flex>
			</Flex>
			<Flex vertical gap={24}>
				<Title level={1} className={`text-h1 ${styles.title}`}>
					وضعیت آبیاری روزانه
				</Title>

				<Table
					columns={columns}
					dataSource={tableData}
					locale={{
						emptyText: 'داده‌ای موجود نیست',
					}}
					bordered
					scroll={{
						x: 'max-content',
					}}
				/>
			</Flex>
		</Flex>
	)
}

export default Dashboard
