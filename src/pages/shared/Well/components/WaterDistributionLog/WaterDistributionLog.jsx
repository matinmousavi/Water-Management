import { Button, Card, Flex, Typography } from 'antd'
import { useState } from 'react'
const { Title } = Typography

const WaterDistributionLog = ({ waterDistributionData }) => {
    
        const [isShowModal, setIsShowModal] = useState(false)
    
	return (
		<>
			<Card>
				<Flex vertical gap={(0, 40)}>
					<Flex align='center' justify='space-between'>
						<Title level={2} className='text-h2'>
							 لاگ توزیع آب {`(${waterDistributionData?.lands?.length})`}
						</Title>
						<Button onClick={() => setIsShowModal(true)} type='dashed'>
							افزودن لاگ
						</Button>
					</Flex>
				</Flex>
			</Card>
		</>
	)
}

export default WaterDistributionLog
