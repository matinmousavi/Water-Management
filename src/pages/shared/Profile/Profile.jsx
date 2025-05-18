import { Flex } from 'antd'
import { useParams } from 'react-router-dom'
import useAPI from '../../../hooks/useAPI'
import { useUser } from '../../../contexts/UserContext'
import Loading from '../../../components/Loading/Loading'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'
import DeleteUserCard from './components/DeleteUserCard/DeleteUserCard'
import styles from './Profile.module.css'
import MetaTitle from '../../../components/MetaTitle/MetaTitle'

const Profile = () => {
	const { isAdmin } = useUser()
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

			<Flex vertical justify='space-between'>
				<h1 className={styles.title}>{pageTitle}</h1>
				<ProfileImageCard initialSrc={data.user.profilePicture?.url} />
				<ContactInfoCard userData={data.user} profileApi={profileApi} />
				{isAdmin && <DeleteUserCard />}
			</Flex>
		</>
	)
}

export default Profile
