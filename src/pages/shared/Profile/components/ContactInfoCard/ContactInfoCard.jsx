import { Card, Typography, Flex } from 'antd'

import ContactInfoDisplay from './components/ContactInfoDisplay/ContactInfoDisplay'
import React from 'react'
import useAPI from '../../../../../hooks/useAPI'
import EditUser from './components/EditUser/EditUser'

const ContactInfoCard = ({ initialValue, setPageTitle }) => {
	const api = useAPI()

	return (
		<Card>
			<Flex vertical gap={36}>
				<Flex align='center' justify='space-between'>
					<Typography.Title level={2} className='text-card-title'>
						مشخصات کاربر
					</Typography.Title>

					<EditUser initialValue={initialValue} setData={api.setData} setPageTitle={setPageTitle} />
				</Flex>

				<ContactInfoDisplay userData={api.data.user || initialValue} />
			</Flex>
		</Card>
	)
}

export default React.memo(ContactInfoCard)
