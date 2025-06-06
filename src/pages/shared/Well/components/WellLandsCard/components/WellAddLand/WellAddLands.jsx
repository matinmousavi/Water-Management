import { Button, Flex } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../hooks/useModal'
import WellAddLandsForm from '../WellAddLandsForm/WellAddLandsForm'
import WellModal from '../../../../../../../components/Well/WellModal/WellModal'

const WellAddLands = ({ lands, setLandsData }) => {
	const { isOpen, open, close } = useModal()

	return (
		<>
			<Button type='default' size='middle' onClick={open}>
				<Flex gap={8}>
					<PlusCircleOutlined />
					<span>افزودن زمین</span>
				</Flex>
			</Button>

			<WellModal
				type='edit'
				editSection='lands'
				data={lands}
				setData={data => setLandsData({ lands: data.well.lands })}
				isOpen={isOpen}
				setIsOpen={close}
			>
				<WellAddLandsForm />
			</WellModal>
		</>
	)
}

export default WellAddLands
