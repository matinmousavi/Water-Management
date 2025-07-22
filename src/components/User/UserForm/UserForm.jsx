import { useEffect, useState } from 'react'
import { Form, Input, Select, Upload, message, Modal, Flex } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'

const beforeUpload = file => {
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

const ROLES = [
	{ key: 'admin', label: 'مدیر' },
	{ key: 'irrigator', label: 'میراب' },
	{ key: 'landOwner', label: 'مالک زمین' },
]

const UserForm = ({ form, setImageFile, initialImage }) => {
	const [previewVisible, setPreviewVisible] = useState(false)
	const [previewImage, setPreviewImage] = useState('')
	const [fileList, setFileList] = useState([])

	useEffect(() => {
		setFileList([])

		if (initialImage?.url && initialImage?.name) {
			setFileList([
				{
					uid: '-1',
					name: initialImage.name,
					status: 'done',
					url: initialImage.url,
				},
			])
		}
	}, [initialImage])

	const handleChange = ({ fileList: newFileList }) => {
		setFileList(newFileList)
		if (newFileList.length > 0) {
			setImageFile(newFileList[0].originFileObj)
		}
	}

	const handlePreview = async file => {
		if (!file.url && !file.preview) {
			file.preview = await new Promise(resolve => {
				const reader = new FileReader()
				reader.readAsDataURL(file.originFileObj)
				reader.onload = () => resolve(reader.result)
			})
		}
		setPreviewImage(file.url || file.preview)
		setPreviewVisible(true)
	}

	const handleRemove = () => {
		setFileList([])
		setImageFile('delete')
	}

	return (
		<>
			<Form form={form} layout='horizontal' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} colon={false} labelAlign='left'>
				<Form.Item label='تصویر'>
					<ImgCrop rotationSlider>
						<Upload
							accept='.jpg,.png'
							listType='picture'
							maxCount={1}
							beforeUpload={beforeUpload}
							fileList={fileList}
							onChange={handleChange}
							onPreview={handlePreview}
							onRemove={handleRemove}
							showUploadList={{
								showPreviewIcon: true,
								showRemoveIcon: true,
								removeIcon: <DeleteOutlined />,
							}}
							customRequest={({ onSuccess }) => setTimeout(() => onSuccess('ok'), 0)}
						>
							{fileList.length === 0 && (
								<Flex
									gap={8}
									align='center'
									justify='center'
									style={{
										border: '1px dashed #3B8FF3',
										borderRadius: 4,
										width: '100%',
										height: 40,
										color: '#3B8FF3',
										cursor: 'pointer',
									}}
								>
									<PlusOutlined />
									<div>انتخاب عکس پروفایل</div>
								</Flex>
							)}
						</Upload>
					</ImgCrop>
				</Form.Item>

				<Form.Item label='نام' name='firstName' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
					<Input size='large' />
				</Form.Item>

				<Form.Item label='نام خانوادگی' name='lastName' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
					<Input size='large' />
				</Form.Item>

				<Form.Item label='نقش' name='role' rules={[{ required: true, message: 'این فیلد الزامی است' }]}>
					<Select placeholder='انتخاب' options={ROLES.map(r => ({ value: r.key, label: r.label }))} size='large' />
				</Form.Item>

				<Form.Item label='کد حساب‌داری' name='accountingCode'>
					<Input size='large' />
				</Form.Item>

				<Form.Item
					label='شماره تماس'
					name='mobile'
					rules={[
						{ required: true, message: 'شماره موبایل الزامی است' },
						{
							pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
							message: 'شماره موبایل معتبر نیست!',
						},
					]}
				>
					<Input maxLength={11} inputMode='numeric' size='large' />
				</Form.Item>
				<Form.Item
					label='آدرس ایمیل'
					name='email'
					rules={[
						{
							pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
							message: 'فرمت ایمیل معتبر نیست',
						},
					]}
				>
					<Input size='large' />
				</Form.Item>
				<Form.Item label='آدرس' name='address'>
					<Input.TextArea rows={3} size='large' />
				</Form.Item>


			</Form>

			<Modal open={previewVisible} title='پیش‌نمایش تصویر' footer={null} onCancel={() => setPreviewVisible(false)}>
				<img alt='preview' style={{ width: '100%' }} src={previewImage} />
			</Modal>
		</>
	)
}

export default UserForm
