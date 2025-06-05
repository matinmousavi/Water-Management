import { Select } from 'antd'
import { useEffect } from 'react'
import useAPI from '../../hooks/useAPI'

const SelectWell = ({ value, onChange }) => {
	const api = useAPI()

	useEffect(() => {
		api.get('wells')
	}, [])

	const handleChange = selectedId => {
		if (!selectedId) {
			onChange(null)
			return
		}
		const selected = api.data?.wells?.find(user => user._id === selectedId)
		onChange?.({
			_id: selectedId,
			title: selected?.title,
		})
	}

	return (
		<Select
			showSearch
			placeholder='جاه را انتخاب کنید'
			loading={api.isLoading}
			value={value?._id}
			onChange={handleChange}
			allowClear
			style={{ width: '100%' }}
			filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
			options={api.data?.wells?.map(user => ({
				value: user._id,
				label: user.title,
			}))}
		/>
	)
}

export default SelectWell
