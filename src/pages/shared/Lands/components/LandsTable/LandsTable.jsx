import { Table, Tag } from 'antd'
import { Link } from 'react-router-dom'

const LandsTable = ({ landsData = [] }) => {
	const allIrrigators = Array.from(new Set(landsData.flatMap(land => land.wells?.map(well => `${well.irrigator.firstName} ${well.irrigator.lastName}`)))).map(
		name => ({
			text: name,
			value: name,
		})
	)

	const uniqueOwners = Array.from(new Set(landsData.map(land => `${land.owner.firstName} ${land.owner.lastName}`))).map(name => ({
		text: name,
		value: name,
	}))

	const uniqueLandNames = Array.from(new Set(landsData.map(land => land.title))).map(name => ({
		text: name,
		value: name,
	}))

	const ownerMobiles = Array.from(new Set(landsData.map(land => land.owner.mobile))).map(mobile => ({
		text: mobile,
		value: mobile,
	}))

	const irrigationTypes = ['قطره‌ای', 'بارانی', 'سطحی', 'چاه دستی', 'سایر']

	const columns = [
		{
			title: 'عنوان زمین',
			dataIndex: 'title',
			key: 'title',
			filters: uniqueLandNames,
			onFilter: (value, record) => record.title.includes(value),
			filterSearch: true,
			render: (title, record) => <Link to={`/lands/${record._id}`}>{title}</Link>,
		},
		{
			title: 'مالک زمین',
			dataIndex: 'owner',
			key: 'owner',
			filters: uniqueOwners,
			onFilter: (value, record) => `${record.owner.firstName} ${record.owner.lastName}`.includes(value),
			filterSearch: true,
			render: (_, record) => (
				<Link to={`/users/${record.owner._id}`}>
					{record.owner.firstName} {record.owner.lastName}
				</Link>
			),
		},
		{
			title: 'شماره تماس مالک زمین',
			dataIndex: 'mobile',
			key: 'mobile',
			filters: ownerMobiles,
			onFilter: (value, record) => record.owner.mobile === value,
			render: (_, record) => record.owner.mobile,
		},
		{
			title: 'عنوان چاه‌',
			key: 'wellTitles',
			render: (_, record) =>
				record.wells?.map(well => (
					<Link key={well._id} to={`/wells/${well._id}`}>
						{well.title}
					</Link>
				)),
		},
		{
			title: 'میرآب',
			key: 'irrigator',
			filters: allIrrigators,
			onFilter: (value, record) => record.wells.some(well => `${well.irrigator.firstName} ${well.irrigator.lastName}` === value),
			render: (_, record) =>
				record.wells?.map(well => (
					<Link key={well._id} to={`/wells/${well._id}`}>
						{`${well.irrigator.firstName} ${well.irrigator.lastName}`}
					</Link>
				)),
		},
		{
			title: 'نوع آبیاری',
			dataIndex: 'irrigationType',
			key: 'irrigationType',
			filters: irrigationTypes.map(type => ({
				text: type,
				value: type,
			})),
			onFilter: (value, record) => record.irrigationType === value,
			render: type => type || '-',
		},
		{
			title: 'وضعیت',
			dataIndex: 'status',
			key: 'status',
			render: status => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'فعال' : 'غیرفعال'}</Tag>,
		},
	]

	return (
		<Table
			columns={columns}
			rowKey='_id'
			dataSource={landsData}
			pagination={{
				position: ['bottomCenter'],
				total: landsData?.length,
				pageSize: 6,
			}}
			scroll={{ x: 'max-content' }}
			bordered
		/>
	)
}

export default LandsTable
