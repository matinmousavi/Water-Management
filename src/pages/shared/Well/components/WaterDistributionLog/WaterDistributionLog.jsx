import { Button, Card, Flex, Typography } from 'antd'
import WaterDistributionLogModal from '../WaterDistributionLogModal/WaterDistributionLogModal'
import { useState } from 'react'
const { Title } = Typography

const WaterDistributionLog = ({ data, wellId }) => {
	const [isShowModal, setIsShowModal] = useState(false)

	return (
		<>
			<Card>
				<Flex vertical gap={(0, 40)}>
					<Flex align='center' justify='space-between'>
						<Title level={2} className='text-h2'>
							لاگ توزیع آب {`(${String(data?.length)})`}
						</Title>
						<Button onClick={() => setIsShowModal(true)} type='dashed'>
							افزودن لاگ
						</Button>
					</Flex>
				</Flex>
			</Card>
			<WaterDistributionLogModal isOpen={isShowModal} setIsOpen={setIsShowModal} lands={data} wellId={wellId} />
		</>
	)
}

export default WaterDistributionLog
