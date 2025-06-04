import { Card, Typography, Button, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'

import ContactInfoDisplay from './components/ContactInfoDisplay/ContactInfoDisplay'
import UserModal from '../../../../../components/User/UserModal/UserModal'
import ModalController from '../../../../../components/ModalController/ModalController'
import React from 'react'

const ContactInfoCard = ({ api, initialUserData }) => {
	return (
		<Card>
			<Flex align='center' justify='space-between'>
				<Typography.Title level={2} className='text-h2'>
					مشخصات کاربر
				</Typography.Title>

				<ModalController>
					<ModalController.Trigger>
						<Button type='default' color='primary' icon={<EditOutlined />} size='middle' disabled={api.isLoading}>
							ویرایش
						</Button>
					</ModalController.Trigger>

					<ModalController.Modal>
						<UserModal type='edit' initialUserData={initialUserData} api={api} />
					</ModalController.Modal>
				</ModalController>
			</Flex>

			<ContactInfoDisplay userData={api.data.user || initialUserData} />
		</Card>
	)
}

export default React.memo(ContactInfoCard)
