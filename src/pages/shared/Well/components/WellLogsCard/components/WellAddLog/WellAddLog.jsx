import { Button, Flex } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../hooks/useModal'
import IrrigationModal from '../../../../../../../components/IrrigationModal/IrrigationModal'
import WellLogForm from '../WellLogForm/WellLogForm'

const WellAddLog = ({ wellId }) => {
	const { isOpen, open, close } = useModal()

	return (
		<>
			<Button type='default' size='middle' onClick={open}>
				<Flex gap={8}>
					<PlusCircleOutlined />
					<span>افزودن لاگ</span>
				</Flex>
			</Button>

			<IrrigationModal type='add' wellId={wellId} isOpen={isOpen} setIsOpen={close}>
				<WellLogForm />
			</IrrigationModal>
		</>
	)
}

export default WellAddLog
