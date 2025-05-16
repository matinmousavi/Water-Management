import { Flex, Spin } from 'antd'
import ProfileImageCard from './components/ProfileImageCard'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import styles from './Profile.module.css'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'

const Profile = () => {
	const profileApi = useAPI()
	profileApi.init('me')
	const { data, isLoading } = profileApi
	return (
		<Flex vertical justify='space-between'>
			{isLoading && <Loading />}
			{!isLoading && data && (
				<>
					<h1 className={styles.title}>پروفایل - متین موسوی</h1>
					<ProfileImageCard />
					<ContactInfoCard userData={data.user} profileApi={profileApi}/>
				</>
			)}
		</Flex>
	)
}

export default Profile
