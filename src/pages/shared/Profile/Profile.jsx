import { Flex, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'

import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import { useUser } from '../../../contexts/UserContext'

const { Title } = Typography

const Profile = () => {
	const { user } = useUser()
	const { userId } = useParams()
	const profileApi = useAPI()

	if (userId) {
		profileApi.init(`users/${userId}`)
	}

	const userData = userId ? profileApi.data?.user : user

	const { firstName = '', lastName = '' } = userData || {}
	const fullName = `${firstName} ${lastName}`
	const pageTitle = fullName ? `پروفایل - ${fullName}` : 'پروفایل'

	if (userId && (profileApi.isLoading || !profileApi.data)) return <Loading />

	return (
		<>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between' gap={15}>
				<Title className='text-h1'>{pageTitle}</Title>
				<ProfileImageCard pictureUrl={userData.profilePicture?.url} />
				<ContactInfoCard userData={userData} />
			</Flex>
		</>
	)
}

export default Profile
