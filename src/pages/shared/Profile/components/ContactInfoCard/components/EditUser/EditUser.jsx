import { Button, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../hooks/useModal'
import UserModal from '../../../../../../../components/User/UserModal/UserModal'
import UserForm from '../../../../../../../components/User/UserForm/UserForm'

const EditUser = ({ initialData, setData, setPageTitle }) => {
	const { isOpen, open, close } = useModal()

	return (
		<>
			<Button type='primary' onClick={open}>
				<Flex gap={5} align='center' justify='center'>
					<EditOutlined />
					<span>ویرایش</span>
				</Flex>
			</Button>

			<UserModal
				type='edit'
				isOpen={isOpen}
				setIsOpen={close}
				initialData={initialData}
				setData={({ user }) =>
					setData(prev => {
						const { firstName: _, lastName: __, ...newRest } = user
						const { firstName: ___, lastName: ____, ...prevRest } = prev || {}

						const hasOtherChanges = Object.keys(newRest).some(key => newRest[key] !== prevRest[key])

						return hasOtherChanges ? user : prev
					})
				}
				setPageTitle={newTitle => setPageTitle(prevTitle => (newTitle !== prevTitle ? newTitle : prevTitle))}
			>
				<UserForm />
			</UserModal>
		</>
	)
}

export default EditUser
