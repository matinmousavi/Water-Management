import { Select } from 'antd'
import useAPI from '../../../hooks/useAPI'
import { useEffect } from 'react'

const SelectOwner = ({ value, onChange }) => {
	const api = useAPI()

	useEffect(() => {
		api.get('users', { role: 'landOwner' })
	}, [])

	const handleChange = selectedId => {
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
			filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
			options={api.data?.users?.map(user => ({
				value: user._id,
				label: `${user.firstName} ${user.lastName}`,
			}))}
		/>
	)
}

export default SelectOwner
