// Profile.jsx
import { Flex } from 'antd';
import styles from './Profile.module.css';
import ProfileImageCard from './components/ProfileImageCard';
import ContactInfoCard from './components/ContactInfoCard';
import ChangePasswordCard from './components/ChangePasswordCard';

const Profile = () => {
  return (
    <Flex vertical justify='space-between'>
      <h1 className={styles.title}>پروفایل - متین موسوی</h1>
      <ProfileImageCard />
      <ContactInfoCard />
      <ChangePasswordCard />
    </Flex>
  );
};

export default Profile;
