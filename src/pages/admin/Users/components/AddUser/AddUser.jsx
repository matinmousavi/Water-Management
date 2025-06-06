import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import UserModal from '../../../../../components/User/UserModal/UserModal'
import UserForm from '../../../../../components/User/UserForm/UserForm'
import useModal from '../../../../../hooks/useModal'

const AddUser = ({ setUser }) => {
	const { isOpen, open, close } = useModal()

	const handleSetUser = ({ user }) => {
		setUser(prev => ({
			...prev,
			users: [...(prev?.users || []), user],
		}))
	}

	return (
		<>
			<Button type='primary' onClick={open}>
				<Flex gap={5} align='center' justify='center'>
					<PlusOutlined />
					<span>افزودن کاربر</span>
				</Flex>
			</Button>

			<UserModal type='add' isOpen={isOpen} setIsOpen={close} setData={handleSetUser}>
				<UserForm />
			</UserModal>
		</>
	)
}

export default AddUser
