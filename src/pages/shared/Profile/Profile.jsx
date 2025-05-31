import { Flex, Tag, Typography } from 'antd'
import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import { useUser } from '../../../contexts/UserContext'
import { useEffect } from 'react'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'

const { Title } = Typography

const Profile = () => {
	const { user } = useUser()
	const { userId } = useParams()
	const api = useAPI()

	useEffect(() => {
		if (userId) api.init(`users/${userId}`)
	}, [userId, api])

	const initialUserData = userId ? api.data?.user : user

	const { firstName = '', lastName = '' } = initialUserData || {}
	const fullName = `${firstName} ${lastName}`
	const pageTitle = fullName || 'پروفایل'

	if (userId && (api.isLoading || !api.data)) return <Loading />

	return (
		<>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between'>
				<Breadcrumbs data={initialUserData} />
				<Flex align='center' gap={16}>
					<BackButton backTo='/users' />
					<Title level={1} className='text-page-title'>
						{pageTitle}
					</Title>
				</Flex>
				<ProfileImageCard pictureUrl={initialUserData?.profilePicture?.url} />
				<ContactInfoCard initialUserData={initialUserData} />
			</Flex>
		</>
	)
}

export default Profile
