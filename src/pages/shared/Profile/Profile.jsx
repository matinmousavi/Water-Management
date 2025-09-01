import { Flex, Grid, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import BackButton from '../../../components/BackButton/BackButton'
import UserStatus from './components/UserStatus'

const { Title } = Typography

const Profile = () => {
	const { userId } = useParams()
	const api = useAPI()
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs

	if (userId) api.init(`users/${userId}`)

	const rawUserData = api.data?.user
	const userDataRef = useRef(null)
	const [pageTitle, setPageTitle] = useState('پروفایل')

	useEffect(() => {
		if (rawUserData && !userDataRef.current) {
			userDataRef.current = rawUserData
			const defaultTitle = rawUserData.fullName || 'پروفایل'
			setPageTitle(defaultTitle)
		}
	}, [rawUserData])

	if (userId && (api.isLoading || !api.data)) return <Loading />

	const userData = userDataRef.current || {}

	return (
		<>
			<MetaTitle>{pageTitle}</MetaTitle>

			<Flex vertical justify='space-between' gap={isMobile && 16}>
				<Flex align='center' gap={16}>
					<BackButton backTo='/users' />

					<Title level={1} className='text-page-title'>
						{pageTitle}
					</Title>

					<UserStatus userId={userData._id} currentStatus={userData.status} />
				</Flex>

				<ContactInfoCard initialValue={userData} setPageTitle={setPageTitle} />
			</Flex>
		</>
	)
}

export default Profile
