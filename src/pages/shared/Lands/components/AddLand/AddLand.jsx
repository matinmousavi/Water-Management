import { Button, Flex } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useCallback } from 'react'
import LandModal from '../../../../../components/Land/LandModal/LandModal'
import LandForm from '../../../../../components/Land/LandForm/LandForm'
import useModal from '../../../../../hooks/useModal'

const AddLand = ({ setData }) => {
	const { isOpen, open, close } = useModal()

	const handleAddLand = useCallback(
		({ land }) => {
			setData(prev => ({
				...prev,
				lands: [...prev.lands, land],
			}))
		},
		[setData]
	)

	return (
		<>
			<Button type='primary' onClick={open}>
				<Flex gap={5} align='center' justify='center'>
					<PlusOutlined />
					<span>افزودن زمین</span>
				</Flex>
			</Button>

			<LandModal type='add' isOpen={isOpen} setIsOpen={close} setData={handleAddLand}>
				<LandForm />
			</LandModal>
		</>
	)
}

export default AddLand
