import { Button, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import LandForm from '../../../../../../../components/Land/LandForm/LandForm'
import LandModal from '../../../../../../../components/Land/LandModal/LandModal'
import useModal from '../../../../../../../hooks/useModal'

const LandEdit = ({ landData, setLandData }) => {
	const { isOpen, open, close } = useModal()

	return (
		<>
			<Button type='default' size='middle' onClick={open}>
				<Flex gap={8}>
					<EditOutlined />
					<span>ویرایش</span>
				</Flex>
			</Button>

			<LandModal setLandsData={data => setLandData({ land: data.land })} type='edit' landData={landData} isOpen={isOpen} setIsOpen={close}>
				<LandForm />
			</LandModal>
		</>
	)
}
export default LandEdit
