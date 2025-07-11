import { Button, Flex, Space } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import styles from './NoteList.module.css'

const NoteList = ({ data, handleDeleteClick, handleEditNote, status }) => {
	return (
		<Flex vertical gap={8}>
			{data?.map(note => (
				<div key={note?._id} className={styles.fakePopoverBox}>
					<div className={styles.arrowLeft}></div>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between'>
							<Flex align='center' gap={20}>
								<h4 className={styles.userName}>{note?.user ? `${note?.user.firstName} ${note?.user.lastName}` : 'کاربر ناشناس'}</h4>
								<span className={styles.date}>
									{new Date(note?.createdAt).toLocaleDateString('fa-IR', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</span>
							</Flex>
							{status === 'active' && (
								<Space className={styles.btns}>
									<Button type='link' icon={<EditOutlined />} onClick={() => handleEditNote(note)} />
									<Button type='link' icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(note)} />
								</Space>
							)}
						</Flex>
						<p className={styles.commentText}>{note?.text}</p>
					</Flex>
				</div>
			))}
		</Flex>
	)
}
export default NoteList
