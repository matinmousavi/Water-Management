import { Modal } from 'antd'
import WellFormLands from '../WellFormLands/WellFormLands'

const WellModalLands = ({ open, onClose, api, form, handleSubmit }) => {
	return (
		<Modal
			title='افرودن زمین'
			centered
			open={open}
			onCancel={onClose}
			onOk={handleSubmit}
			okText='ذخیره'
			cancelText='انصراف'
			confirmLoading={api.isLoading}
		>
			<WellFormLands form={form} wellData={api.data?.well} />
		</Modal>
	)
}
export default WellModalLands
