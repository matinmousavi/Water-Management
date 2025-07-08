import { Form, Select } from 'antd'

const WellAddLandsForm = ({ form, lands = [] }) => {
	const activeLands = lands.filter(land => land.status == "active");
	
	return (
		<Form form={form} layout='horizontal' labelCol={{ flex: '160px' }} wrapperCol={{ flex: 'auto' }}>
			<Form.Item name='lands' label='زمین'>
				<Select
					mode='multiple'
					showSearch
					placeholder='انتخاب'
					allowClear
					style={{ width: '100%' }}
					size='large'
					filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
					options={activeLands.map(land => ({
						value: land._id,
						label: land.title,
					}))}
				/>
			</Form.Item>
		</Form>
	)
}

export default WellAddLandsForm
