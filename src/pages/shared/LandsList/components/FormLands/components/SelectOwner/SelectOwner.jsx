import { Select } from 'antd'
import useAPI from '../../../../../../../hooks/useAPI'
import { useEffect } from 'react'
import { useUser } from '../../../../../../../contexts/UserContext'

const SelectOwner = ({ value, onChange }) => {
	const { init, get, data, loading } = useAPI()
	const { isAdmin } = useUser()

	init('users')
	useEffect(() => {
		const getUsers = async () => {
			try {
				const params = {
					role: isAdmin ? 'admin' : null,
					...(value?.firstName && { firstName: value.firstName }),
					...(value?.lastName && { lastName: value.lastName }),
				}

				await get(`users`, { params })
			} catch (error) {
				console.error('Error fetching users:', error)
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
			loading={loading}
			value={value?._id}
			onChange={handleChange}
			filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
			options={data?.users?.map(user => ({
				value: user._id,
				label: `${user.firstName} ${user.lastName}`,
			}))}
		/>
	)
}

export default SelectOwner
