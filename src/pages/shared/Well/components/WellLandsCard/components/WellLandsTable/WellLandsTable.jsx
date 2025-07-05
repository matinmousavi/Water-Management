import { Modal, Space, Table } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import { useUser } from '../../../../../../../contexts/UserContext'
import useModal from '../../../../../../../hooks/useModal'
import { useState } from 'react'
import moment from 'moment-jalaali'

const WellLandsTable = ({ data, setData, wellId }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [selectedLandId, setSelectedLandId] = useState(null)

	const handleDelete = async () => {
		if (!selectedLandId) return
		try {
			const updatedLands = data?.filter(item => item._id !== selectedLandId)
			const response = await wellApi.patch(`wells/${wellId}`, { lands: updatedLands })

			if (!response?.error) {
				openNotification('success', 'زمین از چاه حذف شد')
				setData({ lands: response.well.lands })
			}
		} catch (error) {
			console.error('Error:', error)
			openNotification('error', error?.error?.message || 'خطا در حذف زمین')
		} finally {
			setSelectedLandId(null)
			close()
		}
	}

	const handleCancel = () => {
		setSelectedLandId(null)
		close()
	}

	const columns = [
		{
			title: 'عنوان زمین',
			dataIndex: 'title',
			key: 'title',
			render: (_, record) => <Link to={`/lands/${record._id}`}>{record.title}</Link>,
		},
		{
			title: 'مالک زمین',
			dataIndex: 'owner',
			key: 'owner',
			render: (_, record) => <Link to={`/users/${record.owner?._id}`}>{`${record.owner?.firstName} ${record.owner?.lastName}`}</Link>,
		},
		{
			title: 'شماره تماس مالک',
			dataIndex: ['owner', 'mobile'],
			key: 'mobile',
			render: (_, record) => (record?.owner?.mobile ? record?.owner?.mobile : '--'),
		},
		{
			title: 'آخرین زمان آبیاری',
			dataIndex: 'lastIrrigatedAt',
			key: 'lastIrrigatedAt',
			render: (_, record) => (record?.lastIrrigatedAt ? moment(record.lastIrrigatedAt).locale('fa').format('dddd jD jMMMM jYYYY - ساعت HH:mm') : '--'),
		},
		{
			title: 'زمان آبیاری بعدی',
			dataIndex: 'nextDateIrrigation',
			key: 'nextDateIrrigation',
			render: (_, record) => record?.logs || '--',
		},
	]

	if (isAdmin) {
		columns.push({
			title: 'عملیات',
			dataIndex: 'action',
			key: 'action',
			render: (_, record) => (
				<Space>
					<DeleteTwoTone
						twoToneColor='#ff0000'
						onClick={() => {
							setSelectedLandId(record._id)
							open()
						}}
					/>
				</Space>
			),
		})
	}

	return (
		<>
			<Table dataSource={data} bordered columns={columns} rowKey={record => record._id} pagination={false} />
			<Modal
				title='حذف زمین'
				open={isOpen}
				onOk={handleDelete}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				okText='تایید'
				cancelText='انصراف'
				okButtonProps={{
					danger: true,
					type: 'primary',
				}}
				confirmLoading={wellApi.isLoading}
			/>
		</>
	)
}

export default WellLandsTable
