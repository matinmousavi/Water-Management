import { Form, Input, Button } from "antd"
import styles from '../Login.module.css'
import img from '../../../../assets/images/water.png'

const MobileNumberForm = () => {
  const [form] = Form.useForm()

  const handleMobileSubmit = (values) => {
    console.log('Form values:', values)
  }

  return (
    <div style={{ margin: '0 auto' }}>
      <div className={styles.logo}>
        <div>
          <img src={img} alt="water logo" width={50} height={50} />
        </div>
        <h2 style={{ fontWeight: 700, fontSize: 24, margin: 0, color: '#222' }}>مدیریت آب</h2>
      </div>
      <p style={{ textAlign: 'center', marginBottom: 24, color: '#222', fontSize: 15 }}>
        برای ورود به پنل، شماره موبایل خود را وارد کنید.
      </p>
      <Form form={form} onFinish={handleMobileSubmit} layout='vertical' className={styles.form}>
        <Form.Item
          className={styles.input}
          label='شماره موبایل'
          name='mobile'
          rules={[
            { required: true, message: 'شماره موبایل خود را وارد کنید!' },
            {
              pattern: /^(۰|0)(۹|9)[0-9۰-۹]{9}$/,
              message: 'شماره موبایل معتبر نیست!',
            },
          ]}
        >
          <Input autoFocus size='large' type='tel' inputMode='numeric' maxLength={11} />
        </Form.Item>

        <Form.Item
          className={styles.input}
        >
          <Button htmlType='submit' size='large' block type='primary'>
            ورود
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default MobileNumberForm