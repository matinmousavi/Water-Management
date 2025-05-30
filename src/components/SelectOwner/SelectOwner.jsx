import { Select } from 'antd'
import { useEffect } from 'react'
import useAPI from '../../hooks/useAPI'

const SelectOwner = ({ value, onChange }) => {
	const api = useAPI()

	useEffect(() => {
		api.get('users')
	}, [])

	const handleChange = selectedId => {
		if (!selectedId) {
			onChange(null)
			return
		}
		const selected = api.data?.users?.find(user => user._id === selectedId)
		onChange?.({
			_id: selectedId,
			firstName: selected?.firstName,
			lastName: selected?.lastName,
		})
	}

	return (
		<Select
			showSearch
			placeholder='مالک را انتخاب کنید'
			loading={api.isLoading}
			value={value?._id}
			onChange={handleChange}
			allowClear
			style={{ width: '100%' }}
			filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
			options={api.data?.users?.map(user => ({
				value: user._id,
				label: `${user.firstName} ${user.lastName}`,
			}))}
		/>
	)
}

export default SelectOwner
