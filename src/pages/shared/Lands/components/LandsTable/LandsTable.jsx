import { Table, Tag } from 'antd'
import { Link } from 'react-router-dom'

const LandsTable = ({ landsData = [] }) => {
	const allIrrigators = Array.from(
		new Set(landsData.flatMap(land => (land.wells || []).filter(well => well.irrigator).map(well => `${well.irrigator.fullName}`)))
	).map(name => ({ text: name, value: name }))

	const uniqueOwners = Array.from(new Set(landsData.map(land => `${land.owner?.fullName || '-'}`.trim()))).map(name => ({
		text: name,
		value: name,
	}))

	const uniqueLandNames = Array.from(new Set(landsData.map(land => land.title || '-'))).map(name => ({ text: name, value: name }))

	const ownerMobiles = Array.from(new Set(landsData.map(land => land.owner?.mobile || '-'))).map(mobile => ({ text: mobile, value: mobile }))

	const allWellTitles = Array.from(new Set(landsData.flatMap(land => (land.wells || []).map(well => well.title || '-')))).map(title => ({
		text: title,
		value: title,
	}))

	const irrigationTypes = ['قطره‌ای', 'بارانی', 'سطحی', 'چاه دستی', 'سایر']

	const columns = [
		{
			title: 'عنوان زمین',
			dataIndex: 'title',
			key: 'title',
			width: 188,
			filters: uniqueLandNames,
			onFilter: (value, record) => (record.title || '').includes(value),
			filterSearch: true,
			render: (title, record) => <Link to={`/lands/${record._id}`}>{title || '-'}</Link>,
		},
		{
			title: 'مالک زمین',
			key: 'owner',
			width: 188,
			filters: uniqueOwners,
			onFilter: (value, record) => `${record.owner?.fullName || '-'}`.trim().includes(value),
			filterSearch: true,
			render: (_, record) => {
				const name = record.owner?.fullName || '-'
				return record.owner?._id ? <Link to={`/users/${record.owner._id}`}>{`${name}`.trim()}</Link> : '-'
			},
		},
		{
			title: 'شماره تماس مالک زمین',
			key: 'mobile',
			width: 188,
			filters: ownerMobiles,
			onFilter: (value, record) => (record.owner?.mobile || '-') === value,
			render: (_, record) => record.owner?.mobile || '-',
		},
		{
			title: 'عنوان چاه',
			key: 'wellTitles',
			width: 188,
			filters: allWellTitles,
			onFilter: (value, record) => (record.wells || []).some(well => (well.title || '-') === value),
			filterSearch: true,
			render: (_, record) => {
				const wells = record.wells || []
				if (!wells.length) return '-'
				return wells.map((well, index) => (
					<span key={well._id || index}>
						{well._id ? <Link to={`/wells/${well._id}`}>{well.title || '-'}</Link> : <span>-</span>}
						{index < wells.length - 1 && ' - '}
					</span>
				))
			},
		},
		{
			title: 'میرآب',
			key: 'irrigator',
			width: 188,
			filters: allIrrigators,
			onFilter: (value, record) => (record.wells || []).some(well => well.irrigator && `${well.irrigator.fullName}` === value),
			filterSearch: true,
			render: (_, record) => {
				const wells = record.wells || []
				if (!wells.length) return '-'
				return wells.map((well, index) => (
					<span key={well._id || index}>
						{well.irrigator && well._id ? <Link to={`/wells/${well._id}`}>{well.irrigator.fullName}</Link> : <span>-</span>}
						{index < wells.length - 1 && ' - '}
					</span>
				))
			},
		},
		{
			title: 'نوع آبیاری',
			dataIndex: 'irrigationType',
			key: 'irrigationType',
			width: 188,
			filters: irrigationTypes.map(type => ({ text: type, value: type })),
			onFilter: (value, record) => record.irrigationType === value,
			render: type => type || '-',
		},
		{
			title: 'وضعیت',
			dataIndex: 'status',
			key: 'status',
			width: 188,
			filters: [
				{ text: 'فعال', value: 'active' },
				{ text: 'غیرفعال', value: 'inactive' },
			],
			onFilter: (value, record) => record.status === value,
			render: status => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'فعال' : 'غیرفعال'}</Tag>,
		},
	]

	return (
		<Table
			size='middle'
			columns={columns}
			rowKey='_id'
			dataSource={landsData}
			pagination={{
				position: ['bottomCenter'],
				total: landsData.length,
				pageSize: 6,
			}}
			scroll={{ x: 'max-content' }}
			bordered
		/>
	)
}

export default LandsTable
