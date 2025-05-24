import { Select } from 'antd'
import useAPI from '../../../../../../../hooks/useAPI'
import { useEffect } from 'react'
import { useUser } from '../../../../../../../contexts/UserContext'

const SelectOwner = ({ value, onChange }) => {
	const selectOwnerApi = useAPI()
	const { isAdmin } = useUser()

	useEffect(() => {
		const getUsers = async () => {
			try {
				await selectOwnerApi.get('users', {
					role: isAdmin ? 'admin' : null,
					firstName: value?.firstName,
					lastName: value?.lastName,
				})
			} catch (error) {
				console.error('Error fetching users:', error.error.message)
			}
		}

		getUsers()
	}, [isAdmin, value?.firstName, value?.lastName])

	const handleChange = selectedValue => {
		const selectedUser = data?.users?.find(user => user._id === selectedValue)
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
