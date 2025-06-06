import { Card, Typography, Flex } from 'antd'

import ContactInfoDisplay from './components/ContactInfoDisplay/ContactInfoDisplay'
import React from 'react'
import useAPI from '../../../../../hooks/useAPI'
import EditUser from './components/EditUser/EditUser'

const ContactInfoCard = ({ initialData, setPageTitle }) => {
	const api = useAPI()

	console.log(api.data.user)

	return (
		<Card>
			<Flex align='center' justify='space-between'>
				<Typography.Title level={2} className='text-h2'>
					مشخصات کاربر
				</Typography.Title>

				<EditUser initialData={initialData} setData={api.setData} setPageTitle={setPageTitle} />
			</Flex>

			<ContactInfoDisplay userData={api.data.user || initialData} />
		</Card>
	)
}

export default React.memo(ContactInfoCard)
