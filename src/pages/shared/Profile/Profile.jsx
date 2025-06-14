import { Flex, Tag, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import { useUser } from '../../../contexts/UserContext'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'
import { EditOutlined } from '@ant-design/icons'

const { Title } = Typography

const Profile = () => {
	const [pageTitle, setPageTitle] = useState('')
	const { user: currentUser } = useUser()
	const { userId } = useParams()

	const api = useAPI()
	if (userId) api.init(`users/${userId}`)

	const rawUserData = userId ? api.data?.user : currentUser

	const userDataRef = useRef(null)

	useEffect(() => {
		if (rawUserData && !userDataRef.current) {
			userDataRef.current = rawUserData
			const { firstName = '', lastName = '' } = rawUserData
			const defaultTitle = firstName || lastName ? `${firstName} ${lastName}` : 'پروفایل'
			setPageTitle(defaultTitle)
		}
	}, [rawUserData])

	if (userId && (api.isLoading || !api.data)) return <Loading />

	const userData = userDataRef.current || {}

	return (
		<>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between'>
				<Breadcrumbs data={{ title: pageTitle }} />

				<Flex align='center' gap={16}>
					<BackButton backTo='/users' />

					<Title level={1} className='text-page-title'>
						{pageTitle}
					</Title>

					<Tag color='green'>
						<Flex align='center' gap={3}>
							فعال <EditOutlined />
						</Flex>
					</Tag>
				</Flex>

				<ContactInfoCard initialValue={userData} setPageTitle={setPageTitle} />
			</Flex>
		</>
	)
}

export default Profile
