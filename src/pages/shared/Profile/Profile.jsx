import { Flex } from 'antd'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import styles from './Profile.module.css'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import { useParams } from 'react-router'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'
import DeleteUserCard from './components/DeleteUserCard/DeleteUserCard'
import { useUser } from '../../../contexts/UserContext'

const Profile = () => {
	const { isAdmin } = useUser()
	const profileApi = useAPI()
	const { data, isLoading } = profileApi
	const { userId } = useParams()
	userId ? profileApi.init(`users/${userId}`) : profileApi.init('me')

	return (
		<Flex vertical justify='space-between'>
			{isLoading || !data ? (
				<Loading />
			) : (
				<>
					<h1 className={styles.title}>پروفایل - {data?.user?.firstName} {data?.user?.lastName}</h1>
					<ProfileImageCard initialSrc={data?.user?.profilePicture?.url} />
					<ContactInfoCard userData={data.user} profileApi={profileApi} />
					{isAdmin && <DeleteUserCard />}
				</>
			)}
		</Flex>
	)
}

export default Profile
