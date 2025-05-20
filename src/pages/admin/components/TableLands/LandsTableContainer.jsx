import { Button, Card, Flex, Typography } from 'antd'
import LandsTable from './LandsTable'
import { useState } from 'react'
import useAPI from '../../../../hooks/useAPI'
import Loading from '../../../../components/Loading/Loading'
import FormLands from '../FormLands/FormLands'

const LandsTableContainer = () => {
	const { Title } = Typography
	const [showModalFormLands, setShowModalFormLands] = useState(false)
	const { init, isLoading, get, data } = useAPI()
	init('lands')
	/* useEffect(() => {
            get('lands')
        }, []) */
	if (isLoading || !data) return <Loading />
	const showModal = () => {
		setShowModalFormLands(true)
	}
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
				<FormLands isOpen={showModalFormLands} setIsOpen={setShowModalFormLands} />
			</Card>
		</Flex>
	)
}
export default LandsTableContainer
