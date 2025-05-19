import { Button, Card, Flex, Table } from 'antd'
import Loading from '../../../components/Loading/Loading'
const columns = [
	{
		title: 'صاحب زمین',
		dataIndex: 'firstName',
		key: 'firstName',
	},
	{
		title: 'شماره همراه',
		dataIndex: 'mobile',
		key: 'mobile',
	},
	{
		title: 'منطقه',
		dataIndex: 'location',
		key: 'location',
	},
]
const LandsList = () => {
	/* userApi.init('users')
        useEffect(() => {
            userApi.get('users')
        }, [isRenderList]) */
	//if (isLoading || !data) return <Loading />
	return (
		<Flex vertical gap={10}>
			<Flex align='center' justify='space-between'>
				<h1 className='text-h1'>لیست زمین ها</h1>
				<Button type='primary'>افزودن زمین</Button>
			</Flex>
			<Card>
				<Table columns={columns} />
			</Card>
		</Flex>
	)
}
export default LandsList
