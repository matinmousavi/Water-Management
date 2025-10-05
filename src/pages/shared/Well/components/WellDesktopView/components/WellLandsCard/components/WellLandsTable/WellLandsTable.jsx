import { Button, Flex, Modal, Space, Table } from 'antd'
import { DeleteTwoTone, EditOutlined } from '@ant-design/icons'
import { Link } from 'react-router'
import useNotification from '../../../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../../../hooks/useAPI'
import { useUser } from '../../../../../../../../../contexts/UserContext'
import { useMemo, useState, useEffect } from 'react'
import moment from 'moment-jalaali'
import EditLandGroupModal from '../EditLandGroupModal/EditLandGroupModal'

const WellLandsTable = ({ data, setData, wellId, landGroups }) => {
	const wellApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin, isIrrigator } = useUser()
	const [selectedLand, setSelectedLand] = useState(null)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [editGroupModalContent, setEditGroupModalContent] = useState(null)
	const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024)

	useEffect(() => {
		const handleResize = () => setIsSmallScreen(window.innerWidth < 1024)
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	const handleDelete = async () => {
		if (!selectedLand?._id) return
		try {
			const updatedLands = data.filter(item => item._id !== selectedLand._id)
			const updatedLandsIds = updatedLands.map(land => land._id)
			const updatedGroups = landGroups
				.map(group => ({
					...group,
					lands: group.lands.filter(id => id !== selectedLand._id),
				}))
				.filter(group => group.lands.length > 0)
			const response = await wellApi.patch(`wells/${wellId}`, {
				lands: updatedLandsIds,
				landGroups: updatedGroups,
			})
			openNotification('success', 'زمین از چاه و گروه حذف شد')
			setData({ lands: response.well.lands, landGroups: response.well.landGroups })
		} catch (error) {
			openNotification('error', error?.error?.message || 'خطا در حذف زمین')
		} finally {
			setSelectedLand(null)
			setIsDeleteModalOpen(false)
		}
	}

	const landIdToGroup = useMemo(() => {
		const map = {}
		;(landGroups || []).forEach(group => {
			group.lands.forEach((landId, index) => {
				map[landId] = {
					title: group.title,
					groupId: group.groupId,
					groupSize: group.lands.length,
					orderInGroup: index,
				}
			})
		})
		return map
	}, [landGroups])

	const finalData = useMemo(() => {
		const groupedLandIds = (landGroups || []).flatMap(group => group.lands)
		const groupedSet = new Set(groupedLandIds)
		const groupedLands = groupedLandIds.map(id => data.find(item => item._id === id)).filter(Boolean)
		const ungroupedLands = data.filter(item => !groupedSet.has(item._id))
		return [...groupedLands, ...ungroupedLands]
	}, [data, landGroups])

	const openDeleteModal = land => {
		setSelectedLand(land)
		setIsDeleteModalOpen(true)
	}

	const openEditGroupModal = group => {
		setEditGroupModalContent(
			<EditLandGroupModal
				landGroup={group}
				activeLands={data}
				landGroups={landGroups}
				onClose={() => setEditGroupModalContent(null)}
				wellId={wellId}
				setData={groups =>
					setData(prev => ({
						...prev,
						landGroups: typeof groups === 'function' ? groups(prev.landGroups) : groups,
					}))
				}
			/>
		)
	}

	const groupCell = record => {
		const group = landIdToGroup[record._id]
		if (!group) return { rowSpan: 1 }
		if (group.orderInGroup === 0) return { rowSpan: group.groupSize }
		return { rowSpan: 0 }
	}

	// 📏 عرض ستون‌ها در حالت واکنش‌گرا
	const colWidth = isSmallScreen ? 200 : undefined

	const columns = [
		{
			title: 'گروه',
			width: isSmallScreen ? 180 : undefined,
			render: (_, record) => {
				const group = landIdToGroup[record._id]
				if (!group) return '-'
				return (
					<Flex align='center' gap={8}>
						{isIrrigator ? <Link to={`/wells/${wellId}/groups/${group?.groupId}`}>{group.title}</Link> : <span>{group.title}</span>}
						{isAdmin ? <Button type='link' icon={<EditOutlined />} onClick={() => openEditGroupModal(group)} /> : null}
					</Flex>
				)
			},
			onCell: groupCell,
		},
		{
			title: 'عنوان زمین',
			dataIndex: 'title',
			key: 'title',
			width: colWidth,
			render: (_, record) => <Link to={`/lands/${record._id}`}>{record.title}</Link>,
		},
		{
			title: 'مالک زمین',
			dataIndex: 'owner',
			key: 'owner',
			width: colWidth,
			render: (_, record) => (isAdmin ? <Link to={`/users/${record.owner?._id}`}>{record.owner?.fullName}</Link> : record.owner?.fullName),
		},
		{
			title: 'شماره تماس مالک',
			dataIndex: ['owner', 'mobile'],
			key: 'mobile',
			width: colWidth,
			render: (_, record) => record?.owner?.mobile || '--',
		},
		{
			title: 'آخرین زمان آبیاری',
			dataIndex: 'lastIrrigatedAt',
			key: 'lastIrrigatedAt',
			width: colWidth,
			render: (_, record) => (record?.lastIrrigatedAt ? moment(record.lastIrrigatedAt).locale('fa').format('dddd jD jMMMM jYYYY - ساعت HH:mm') : '--'),
			onCell: groupCell,
		},
		{
			title: 'زمان آبیاری بعدی',
			dataIndex: 'nextDateIrrigation',
			key: 'nextDateIrrigation',
			width: colWidth,
			render: (_, record) => record?.logs || '--',
			onCell: groupCell,
		},
	]

	if (isAdmin) {
		columns.push({
			title: 'عملیات',
			dataIndex: 'action',
			key: 'action',
			width: 120,
			render: (_, record) => (
				<Space size='small'>
					<DeleteTwoTone twoToneColor='#ff0000' onClick={() => openDeleteModal(record)} />
				</Space>
			),
		})
	}

	return (
		<>
			<Table
				size='middle'
				dataSource={finalData}
				bordered
				columns={columns}
				rowKey={record => record._id}
				pagination={false}
				scroll={{
					x: isSmallScreen ? 'max-content' : false,
				}}
			/>

			<Modal
				title={`حذف زمین ${selectedLand?.title || ''}`}
				open={isDeleteModalOpen}
				onOk={handleDelete}
				onCancel={() => setIsDeleteModalOpen(false)}
				okText='تایید'
				cancelText='انصراف'
				okButtonProps={{ danger: true, type: 'primary' }}
				confirmLoading={wellApi.isLoading}
			>
				<p>آیا از حذف این زمین اطمینان دارید؟</p>
			</Modal>

			{editGroupModalContent}
		</>
	)
}

export default WellLandsTable
