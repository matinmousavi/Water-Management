import { Flex, Typography } from 'antd'
import { useParams } from 'react-router-dom'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'
import { useUser } from '../../../contexts/UserContext'
import { useEffect } from 'react'

const { Title } = Typography

const Profile = () => {
	const { user } = useUser()
	const { userId } = useParams()
	const api = useAPI()

	useEffect(() => {
		if (userId) api.init(`users/${userId}`)
	}, [userId])

	const userData = userId ? api.data?.user : user

	const { firstName = '', lastName = '' } = userData || {}
	const fullName = `${firstName} ${lastName}`
	const pageTitle = fullName ? `پروفایل - ${fullName}` : 'پروفایل'

	if (userId && (api.isLoading || !api.data)) return <Loading />

	return (
		<>
			<MetaTitle>پروفایل</MetaTitle>

			<Flex vertical justify='space-between'>
				<Title className='text-h1'>{pageTitle}</Title>
				<ProfileImageCard pictureUrl={userData?.profilePicture?.url} />
				<ContactInfoCard api={api} />
			</Flex>
		</>
	)
}

export default Profile
