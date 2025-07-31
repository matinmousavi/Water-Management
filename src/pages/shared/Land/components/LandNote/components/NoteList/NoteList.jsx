import { Button, Flex, Space } from 'antd'

import moment from 'moment-jalaali'

import styles from './NoteList.module.css'

import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

const NoteList = ({ data, handleDeleteClick, handleEditNote }) => {
	return (
		<Flex vertical gap={8}>
			{data?.map(note => (
				<div key={note?._id} className={styles.fakePopoverBox}>
					<div className={styles.arrowLeft}></div>
					<Flex gap={8} vertical>
						<Flex align='center' justify='space-between'>
							<Flex align='center' gap={20}>
								<h4 className={styles.userName}>{note?.user ? `${note?.user.fullName}` : 'کاربر ناشناس'}</h4>
								<span className={styles.date}>{moment(note?.createdAt).locale('fa').format('jD jMMMM jYYYY - ساعت HH:mm')}</span>
							</Flex>
							<Space className={styles.btns}>
								<Button type='link' icon={<EditOutlined />} onClick={() => handleEditNote(note)} />
								<Button type='link' icon={<DeleteOutlined />} danger onClick={() => handleDeleteClick(note)} />
							</Space>
						</Flex>
						<p className={styles.commentText}>{note?.text}</p>
					</Flex>
				</div>
			))}
		</Flex>
	)
}

export default NoteList
