import { Select } from 'antd'
import useAPI from '../../../../../../../hooks/useAPI'
import { useEffect } from 'react'

const SelectOwner = ({ value, onChange }) => {
	const selectOwnerApi = useAPI()

	useEffect(() => {
		const getUsers = async () => {
			try {
				await selectOwnerApi.get('users', {
					role: 'landOwner',
				})
			} catch (error) {
				console.error('Error fetching users:', error?.error?.message)
			}
		}

		getUsers()
	}, [selectOwnerApi])

	const handleChange = selectedValue => {
		const selectedUser = selectOwnerApi.data?.users?.find(user => user._id === selectedValue)
		if (selectedUser) {
			onChange?.({
				_id: selectedValue,
				firstName: selectedUser.firstName,
				lastName: selectedUser.lastName,
			})
		}
	}

	return (
		<Select
			showSearch
			placeholder='مالک را انتخاب کنید'
			loading={selectOwnerApi.isLoading}
			value={value?._id}
			onChange={handleChange}
			filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
			options={selectOwnerApi.data?.users?.map(user => ({
				value: user._id,
				label: `${user.firstName} ${user.lastName}`,
			}))}
		/>
	)
}

export default SelectOwner
