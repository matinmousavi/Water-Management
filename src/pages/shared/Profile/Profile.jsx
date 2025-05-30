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

	const userData = userId ? api.data?.user : user

	const { firstName = '', lastName = '' } = userData || {}
	const fullName = `${firstName} ${lastName}`
	const pageTitle = fullName || 'پروفایل'

	if (userId && (api.isLoading || !api.data)) return <Loading />

	return (
		<>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between'>
				<Breadcrumbs data={userData} />
				<Flex align='center' gap={16}>
					<BackButton backTo='/users' />
					<Title level={1} className='text-page-title'>
						{pageTitle}
					</Title>
					<Tag icon={<CheckCircleOutlined />} color='success' className='custom-tag'>
						فعال
					</Tag>
				</Flex>
				<ProfileImageCard pictureUrl={userData?.profilePicture?.url} />
				<ContactInfoCard api={api} />
			</Flex>
		</>
	)
}

export default Profile
