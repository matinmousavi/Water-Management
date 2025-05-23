import { Button, Card, Flex, Typography } from 'antd'
import LandsTable from './LandsTable'
import { useEffect, useState } from 'react'
import useAPI from '../../../../../hooks/useAPI'
import Loading from '../../../../../components/Loading/Loading'
import FormLands from '../FormLands/FormLands'

const LandsTableContainer = () => {
	const { Title } = Typography
	const [showModalFormLands, setShowModalFormLands] = useState(false)
	const [isRedner, setIsRedner] = useState(false)
	const { init, isLoading, get, data } = useAPI()
	init('lands')
	const showModal = () => {
		setShowModalFormLands(true)
	}
	useEffect(() => {
		const getNewLadns = async () => {
			try {
				await get('lands')
			} catch (error) {
				console.log(error.error.message)
			}
		}
		getNewLadns()
	}, [isRedner])
	if (isLoading || !data) return <Loading />
	return (
		<Flex vertical gap={10}>
			<Flex align='center' justify='space-between'>
				<Title level={1} className='text-h1'>
					لیست زمین ها
				</Title>
				<Button onClick={showModal} type='primary'>
					افزودن زمین
				</Button>
			</Flex>
			<Card>
				<LandsTable data={data?.lands} />
				<FormLands setIsRenderList={setIsRedner} isOpen={showModalFormLands} setIsOpen={setShowModalFormLands} />
			</Card>
		</Flex>
	)
}
export default LandsTableContainer
