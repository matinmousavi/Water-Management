import { Button, Card, Flex, Form, Input, Modal, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import useApi from '../../../hooks/useAPI'
import { useEffect, useState } from 'react'
const TableUsers = () => {
	const userApi = useApi()
	const [userList, setUserList] = useState([])
	const [isModalOpenFormUser, setIsModalOpenFormUser] = useState(false)
	const [form] = Form.useForm()
	const fetchData = async () => {
		try {
			const data = await userApi.get('/users')
			setUserList(data)
		} catch (error) {
			console.error('Error fetching data:', error)
		}
	}
	useEffect(() => {
		fetchData()
	}, [])

	console.log(userList) // test list users

	const showModal = () => {
		setIsModalOpenFormUser(true)
	}
	/* const dataSource = [
		{
			key: '1',
			lastName: 'محمودی',
			firstName: 'محمد',
			address: 'باغ شوکت آباد',
			mobile: '0911111111',
		},
		{
			key: '2',
			lastName: 'محمودی',
			firstName: 'امیر',
			address: 'باغ بیدمشک',
			mobile: '0911111111',
		},
	] */
	const handleSearch = (selectedKeys, confirm) => {
		confirm()
	}

	const getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					placeholder={`جستجوی ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => handleSearch(selectedKeys, confirm)}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<div style={{ display: 'flex', gap: 8 }}>
					<Button type='primary' onClick={() => handleSearch(selectedKeys, confirm)} icon={<SearchOutlined />} size='small' style={{ width: 90 }}>
						جستجو
					</Button>
				</div>
			</div>
		),
		filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
	})

	const columns = [
		{
			title: 'نام و نام خانوادگی',
			dataIndex: 'firstName',
			key: 'firstName',
			...getColumnSearchProps('firstName'),
			render: (_, record) => (
				<Button type='link'>
					<span>
						{record?.firstName} {record?.lastName}
					</span>
				</Button>
			),
		},
		{
			title: 'شماره همراه',
			dataIndex: 'mobile',
			key: 'mobile',
		},
		{
			title: 'ایمیل',
			dataIndex: 'email',
			key: 'email',
		},
	]
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			await userApi.post('/users', {
				firstName: values.firstName,
				lastName: values.lastName,
				email: values.email,
				mobile: values.mobile,
				role: 'admin',
			})
			form.resetFields()
			setIsModalOpenFormUser(false)
			await fetchData()
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<Card>
			<Flex justify='space-between' style={{ marginBottom: '10px' }}>
				<h2>جدول کاربران</h2>
				<Button onClick={showModal} type='primary'>
					افزودن کاربر
				</Button>
			</Flex>
			<Table scroll={{ x: 'max-content' }} columns={columns} dataSource={userList} rowKey='key' />
			<Modal
				title='فرم افزودن کاربر'
				closable={{ 'aria-label': 'Custom Close Button' }}
				open={isModalOpenFormUser}
				onOk={handleSubmit}
				onCancel={() => setIsModalOpenFormUser(false)}
			>
				<Form form={form} layout='vertical'>
					<Form.Item name='firstName' label='نام' rules={[{ required: true, message: 'لطفاً نام را وارد کنید!' }]}>
						<Input placeholder='مثال: علی' />
					</Form.Item>
					<Form.Item name='lastName' label=' نام خانوادگی' rules={[{ required: true, message: 'لطفاً نام را وارد کنید!' }]}>
						<Input placeholder='مثال: محمدی' />
					</Form.Item>
					<Form.Item
						name='email'
						label='ایمیل'
						rules={[
							{ required: true, message: 'لطفاً ایمیل را وارد کنید!' },
							{ type: 'email', message: 'ایمیل معتبر نیست!' },
						]}
					>
						<Input placeholder='example@domain.com' />
					</Form.Item>

					<Form.Item
						label='شماره موبایل'
						name='mobile'
						rules={[
							{ message: 'شماره موبایل خود را وارد کنید!' },
							{
								pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
								message: 'شماره موبایل معتبر نیست!',
							},
						]}
					>
						<Input placeholder='مثال: 09121111111' type='tel' inputMode='numeric' maxLength={11} />
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	)
}
export default TableUsers
