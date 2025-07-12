import { Card, Typography, Flex, Input, Button } from 'antd'
import { useState } from 'react'
import styles from '../../Notifications.module.css'
import useAPI from '../../../../../../hooks/useAPI'
import useNotification from '../../../../../../hooks/useNotification'

const BroadcastNotification = () => {
	const [text, setText] = useState('')
	const [loading, setLoading] = useState(false)
	const api = useAPI()
	const { openNotification } = useNotification()

	const handleSend = async () => {
		if (!text.trim()) {
			openNotification('warning', 'خطا', 'متن پیام را وارد کنید')
			return
		}

		setLoading(true)
		try {
			const response = await api.post('notifications/broadcast', { text })

			if (response.ok) {
				openNotification('success', 'ارسال موفق', 'پیام با موفقیت برای همه کاربران ارسال شد')
				setText('')
			} else {
				openNotification('error', 'خطا در ارسال', response.message || 'خطا در ارسال پیام')
			}
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا در ارتباط با سرور')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card className={styles.item}>
			<Flex vertical gap='small'>
				<Typography.Title className='text-card-title'>ارسال اطلاع رسانی همگانی</Typography.Title>
				<Input.TextArea rows={4} placeholder='متن پیام را وارد کنید' value={text} onChange={e => setText(e.target.value)} />
				<Flex justify='end'>
					<Button type='primary' onClick={handleSend} loading={loading}>
						ارسال به همه
					</Button>
				</Flex>
			</Flex>
		</Card>
	)
}

export default BroadcastNotification
