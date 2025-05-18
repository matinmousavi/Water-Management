import { Flex } from 'antd'
import { useParams } from 'react-router-dom'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'

import MetaTitle from '../../../components/MetaTitle/MetaTitle'

const Profile = () => {
	const { userId } = useParams()
	const profileApi = useAPI()

	const endpoint = userId ? `users/${userId}` : 'me'
	profileApi.init(endpoint)

	const { data, isLoading } = profileApi

	const { firstName = '', lastName = '' } = data?.user || {}
	const fullName = `${firstName} ${lastName}`
	const pageTitle = fullName ? `پروفایل - ${fullName}` : 'پروفایل'

	if (isLoading || !data) return <Loading />

	return (
		<>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between' gap={15}>
				<h1 className='text-page-title'>{pageTitle}</h1>
				<ProfileImageCard initialSrc={data.user.profilePicture?.url} />
				<ContactInfoCard userData={data.user} />
			</Flex>
		</>
	)
}

export default Profile
