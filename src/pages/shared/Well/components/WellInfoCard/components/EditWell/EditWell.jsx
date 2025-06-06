import { Button, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../hooks/useModal'
import WellModal from '../../../../../../../components/Well/WellModal/WellModal'
import WellForm from '../../../../../../../components/Well/WellForm/WellForm'

const EditWell = ({ initialValue, setData, setPageTitle }) => {
	const { isOpen, open, close } = useModal()

	return (
		<>
			<Button type='default' size='middle' onClick={open}>
				<Flex gap={8}>
					<EditOutlined />
					<span>ویرایش</span>
				</Flex>
			</Button>

			<WellModal
				type='edit'
				editSection='information'
				initialValue={initialValue}
				setData={data => setData({ well: data.well })}
				setPageTitle={setPageTitle}
				isOpen={isOpen}
				setIsOpen={close}
			>
				<WellForm />
			</WellModal>
		</>
	)
}

export default EditWell
