import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import WellModal from '../../../../../components/Well/WellModal/WellModal'
import WellForm from '../../../../../components/Well/WellForm/WellForm'

const AddWell = ({ setData }) => {
	const { isOpen, open, close } = useModal()

	const handleAddWell = ({ well }) => {
		setData(prev => ({
			...prev,
			wells: [...(prev?.wells || []), well],
		}))
	}

	return (
		<>
			<Button type='primary' onClick={open}>
				<Flex gap={5} align='center' justify='center'>
					<PlusOutlined />
					<span>افزودن چاه</span>
				</Flex>
			</Button>

			<WellModal type='add' isOpen={isOpen} setIsOpen={close} setData={handleAddWell}>
				<WellForm />
			</WellModal>
		</>
	)
}

export default AddWell
