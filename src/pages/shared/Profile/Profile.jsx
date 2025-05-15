import { Flex } from 'antd'
import ProfileImageCard from './components/ProfileImageCard'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import styles from './Profile.module.css'

const Profile = () => {
	return (
		<Flex vertical justify='space-between'>
			<h1 className={styles.title}>پروفایل - متین موسوی</h1>
			<ProfileImageCard />
			<ContactInfoCard />
		</Flex>
	)
}

export default Profile
