import { Select } from 'antd'
import { useEffect } from 'react'
import useAPI from '../../../../../hooks/useAPI'

const SelectLands = ({ value, onChange, defalutValues }) => {
	const api = useAPI()

	useEffect(() => {
		api.get('lands', { role: 'admin' })
	}, [])

	const handleChange = selectedIds => {
		if (!selectedIds) {
			onChange?.([])
			return
		}

		const selectedLands = selectedIds.map(id => ({
			_id: id,
		}))

		onChange?.(selectedLands)
	}

	return (
		<Select
			mode='multiple'
			showSearch
			placeholder='زمین‌ها را انتخاب کنید'
			loading={api.isLoading}
			value={value?.map(item => item._id)}
			onChange={handleChange}
			allowClear
			defaultValue={defalutValues}
			style={{ width: '100%' }}
			filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
			options={api.data?.lands?.map(land => ({
				value: land._id,
				label: `${land.name}`,
			}))}
		/>
	)
}

export default SelectLands
