import { Form, Select } from 'antd'

const WellAddLandsForm = ({ form, lands = [] }) => {
	return (
		<Form form={form} layout='vertical'>
			<Form.Item name='lands' label='زمین‌ها'>
				<Select
					mode='multiple'
					showSearch
					placeholder='زمین‌ها را انتخاب کنید'
					allowClear
					style={{ width: '100%' }}
					filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
					options={lands.map(land => ({
						value: land._id,
						label: land.name,
					}))}
				/>
			</Form.Item>
		</Form>
	)
}

export default WellAddLandsForm
