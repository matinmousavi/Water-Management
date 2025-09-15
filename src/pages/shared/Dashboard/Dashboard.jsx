import { Typography, Flex, Table, Tag, Input, Progress } from 'antd'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import DashboardCards from './components/DashboardCards'
import styles from './Dashboard.module.css'

const { Title } = Typography

const Dashboard = () => {
	const [searchedColumn, setSearchedColumn] = useState('')

	const tableData = [
		{ key: '1', wellName: 'نام چاه', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 7, status: 'در حال آبیاری' },
		{ key: '2', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 53, status: 'در حال آبیاری' },
		{ key: '3', wellName: 'نام چاه', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 100, status: 'تاخیر' },
		{ key: '4', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 100, status: '' },
		{ key: '5', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 100, status: '' },
		{ key: '6', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '18:00', waterStatus: 53, status: 'توقف زودهنگام' },
		{ key: '7', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 100, status: '' },
		{ key: '8', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 100, status: '' },
		{ key: '9', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '19:27', waterStatus: 100, status: 'مصرف بیشتر' },
		{ key: '10', wellName: 'نام زمین', land: 'نام زمین', startTime: '17:42', endTime: '18:30', waterStatus: 100, status: '' },
	]

	const getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div className={styles.filterDropdown}>
				<Input
					placeholder={`جستجو ${dataIndex === 'wellName' ? 'عنوان چاه' : 'نام زمین'}`}
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

	const getStatusTag = status => {
		if (!status || status === '') return null

		const statusClassMap = {
			'در حال آبیاری': 'watering',
			تاخیر: 'delay',
			'توقف زودهنگام': 'earlyStop',
			'مصرف بیشتر': 'overConsumption',
		}

		const statusClass = statusClassMap[status]
		return <Tag className={`${styles.tag} ${styles[statusClass]}`}>{status}</Tag>
	}

	const columns = [
		{
			title: 'عنوان چاه',
			dataIndex: 'wellName',
			key: 'wellName',
			render: name => <Link>{name}</Link>,
			...getColumnSearchProps('wellName'),
		},
		{
			title: 'نام زمین',
			dataIndex: 'land',
			key: 'land',
			render: text => <Link>{text}</Link>,
			...getColumnSearchProps('land'),
		},
		{
			title: 'ساعت شروع آبیاری',
			dataIndex: 'startTime',
			key: 'startTime',
			render: (time, record) => {
				return (
					<Flex align='center' gap={8}>
						{time}
						{record.status === 'تاخیر' && getStatusTag('تاخیر')}
					</Flex>
				)
			},
		},
		{
			title: 'ساعت پایان آبیاری',
			dataIndex: 'endTime',
			key: 'endTime',
			render: (time, record) => {
				const { status } = record
				if (status === 'توقف زودهنگام' || status === 'مصرف بیشتر' || status === 'در حال آبیاری') {
					if (status === 'در حال آبیاری') {
						return getStatusTag(status)
					}
					return (
						<Flex align='center' gap={8}>
							<div>{time}</div>
							{getStatusTag(status)}
						</Flex>
					)
				}
				return time
			},
		},
		{
			title: 'وضعیت دریافت آب',
			dataIndex: 'waterStatus',
			key: 'waterStatus',
			render: value => <Progress percent={value} size='small' strokeColor={value === 100 ? '#52c41a' : value > 50 ? '#FFC916' : '#f5222d'} />,
		},
	]

	return (
		<Flex vertical gap={40}>
			<Flex vertical gap={24}>
				<Title level={1} className={`text-h1 ${styles.title}`}>
					داشبورد
				</Title>
				<DashboardCards />
			</Flex>
			<Flex vertical gap={24}>
				<Title level={1} className={`text-h1 ${styles.title}`}>
					وضعیت آبیاری امروز
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
