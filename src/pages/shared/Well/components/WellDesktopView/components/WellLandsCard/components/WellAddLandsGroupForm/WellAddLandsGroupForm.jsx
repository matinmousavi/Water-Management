import { Form, Grid, Input, Select } from 'antd'

const WellAddLandsGroupForm = ({ form, lands = [] }) => {
	const activeLands = lands.filter(land => land.status === 'active')
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	return (
		<Form form={form} layout='horizontal' labelCol={{ flex: !isMobile && '160px' }} wrapperCol={{ flex: 'auto' }}>
			<Form.Item name='groupName' label='نام گروه'>
				<Input size={isMobile ? 'middle' : 'large'} />
			</Form.Item>
			<Form.Item name='lands' label='زمین'>
				<Select
					mode='multiple'
					showSearch
					placeholder='انتخاب'
					className='custom-select'
					allowClear
					size={isMobile ? 'middle' : 'large'}
					filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
					options={activeLands.map(land => ({
						value: land._id,
						label: `${land.title} - ${land?.owner?.fullName}`,
					}))}
				/>
			</Form.Item>
		</Form>
	)
}

export default WellAddLandsGroupForm
