import { Flex, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import { useUser } from '../../../contexts/UserContext'
import Breadcrumbs from '../../../components/BreadCrumbs/BreadCrumbs'
import BackButton from '../../../components/BackButton/BackButton'

const { Title } = Typography

const Profile = () => {
	const { user } = useUser()
	const { userId } = useParams()
	const api = useAPI()

	if (userId) api.init(`users/${userId}`)

	const initialUserData = userId ? api.data?.user : user

	const { firstName = '', lastName = '', ...contactInfoData } = initialUserData || {}

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
				<ContactInfoCard initialUserData={contactInfoData} api={api} />
			</Flex>
		</>
	)
}

export default Profile
