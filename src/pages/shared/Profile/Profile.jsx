import { Flex, Typography } from 'antd'
import ContactInfoCard from './components/ContactInfoCard/ContactInfoCard'
import styles from './Profile.module.css'
import useAPI from '../../../hooks/useAPI'
import Loading from '../../../components/Loading/Loading'
import { useParams } from 'react-router'
import ProfileImageCard from './components/ProfileImageCard/ProfileImageCard'
const { Title } = Typography

const Profile = () => {
	const profileApi = useAPI()
	const { data, isLoading } = profileApi
	const { userId } = useParams()
	userId ? profileApi.init(`users/${userId}`) : profileApi.init('me')

	const titleGeneratoe = () => data?.user?.firstName || data?.user?.lastName ? `پروفایل - ${data?.user?.firstName} ${data?.user?.lastName}` : 'پروفایل من'
	return (
		<Flex vertical justify='space-between'>
			{isLoading || !data ? (
				<Loading />
			) : (
				<>
					<Title level={3} className={styles.title}>{titleGeneratoe()}</Title>
					<ProfileImageCard initialSrc={data?.user?.profilePicture?.url} title={<Title level={4}>عکس پروفایل</Title>}/>
					<ContactInfoCard userData={data.user} profileApi={profileApi} title={<Title level={4}>اطلاعات شخصی</Title>}/>
				</>
			)}
		</Flex>
	)
}

export default Profile
