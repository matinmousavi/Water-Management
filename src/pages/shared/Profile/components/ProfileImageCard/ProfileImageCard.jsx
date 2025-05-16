import { useState } from 'react'
import { Card, Upload, message } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import useAPI from '../../../../../hooks/useAPI'
import styles from './ProfileImageCard.module.css'

const beforeUpload = (file) => {
	const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
	if (!isJpgOrPng) {
		message.error('فقط فرمت JPG/PNG قابل قبول است!')
	}
	const isLt2M = file.size / 1024 / 1024 < 2
	if (!isLt2M) {
		message.error('حجم فایل باید کمتر از ۲ مگابایت باشد!')
	}
	return isJpgOrPng && isLt2M
}

const ProfileImageCard = ({ src }) => {
	const [loading, setLoading] = useState(false)
	const [imageUrl, setImageUrl] = useState(null)
	const uploadApi = useAPI()


	const getBase64 = (file, callback) => {
		const reader = new FileReader()
		reader.addEventListener('load', () => callback(reader.result))
		reader.readAsDataURL(file)
	}

	const customUpload = async ({ file, onSuccess, onError }) => {
		setLoading(true)
		const formData = new FormData()
		formData.append('profilePicture', file)

		try {
			const res = await uploadApi.post('upload/profile/picture', formData)
			if (!res.error) {
				throw new Error(res.message || 'خطا در آپلود')
			}
			getBase64(file, (url) => {
				setImageUrl(url)
				setLoading(false)
				onSuccess(res)
				message.success('عکس با موفقیت آپلود شد')
			})
		} catch (err) {
			console.error(err)
			message.error('آپلود عکس با خطا مواجه شد')
			setLoading(false)
			onError(err)
		}
	}

	const uploadButton = (
		<button style={{ border: 0, background: 'none' }} type='button'>
			{loading ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>آپلود</div>
		</button>
	)

	return (
		<Card>
			<h2>عکس پروفایل</h2>
			<Upload
				name='profilePicture'
				listType='picture-circle'
				showUploadList={false}
				beforeUpload={beforeUpload}
				customRequest={customUpload}
			>
				{imageUrl ? (
					<Image
						wrapperStyle={{ display: 'none' }}
						preview={{
							visible: previewOpen,
							onVisibleChange: (visible) => setPreviewOpen(visible),
							afterOpenChange: (visible) => !visible && setPreviewImage(''),
						}}
						src={src}
					/>
				) : (
					uploadButton
				)}
			</Upload>
		</Card>
	)
}

export default ProfileImageCard
