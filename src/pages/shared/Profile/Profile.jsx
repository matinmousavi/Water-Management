import { Flex } from 'antd'
import ProfileImageCard from './components/ProfileImageCard'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import styles from './Profile.module.css'
import { useParams } from 'react-router'

const Profile = () => {
	const { userId } = useParams()
	console.log(userId)

	return (
		<Flex vertical justify='space-between'>
			<h1 className={styles.title}>پروفایل - متین موسوی</h1>
			<ProfileImageCard />
			<ContactInfoCard userId={userId} />
		</Flex>
	)
}

export default Profile
