import { Flex, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'
import PageHeading from '../../../components/PageHeading/PageHeading'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import { useUser } from '../../../contexts/UserContext'

const Profile = () => {
	const { user } = useUser()
	const { userId } = useParams()
	const profileApi = useAPI()
	const { Title } = Typography
	if (userId) {
		profileApi.init(`users/${userId}`)
	}

	const { data, isLoading } = profileApi

	const userData = userId ? data?.user : user

	const { firstName = '', lastName = '' } = userData || {}
	const fullName = `${firstName} ${lastName}`
	const pageTitle = fullName ? `پروفایل - ${fullName}` : 'پروفایل'

	if (userId && (isLoading || !data)) return <Loading />

	return (
		<PageHeading id={userId}>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between' gap={15}>
				<Title className='text-h1'>{pageTitle}</Title>
				<ProfileImageCard initialSrc={userData.profilePicture?.url} />
				<ContactInfoCard userData={userData} />
			</Flex>
		</PageHeading>
	)
}

export default Profile
