import { useEffect, useCallback } from 'react'
import { Modal, Form } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import IrrigationLogForm from '../IrrigationLogForm/IrrigationLogForm'
import dayjs from 'dayjs'
import { useUser } from '../../../contexts/UserContext'

const combineDateTime = (date, time) => {
    if (!date || !time) return date
    const validDate = dayjs(date)
    const validTime = dayjs(time)
    return validDate.hour(validTime.hour()).minute(validTime.minute()).second(0).millisecond(0)
}

const EditIrrigationLog = ({ data, setLogs, onClose, page = 'well' }) => {
    const [form] = Form.useForm()
    const irrigationApi = useAPI()
    const landsApi = useAPI() // **FIX:** Re-added API call for complete lands list
    const { openNotification } = useNotification()
    const { isAdmin } = useUser()

    useEffect(() => {
        landsApi.init('lands') // **FIX:** Fetch all lands to ensure the Select component has full options
    }, [])

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                ...data,
                landId: data.landGroup ? `group-${data.landGroup}` : data.land?._id,
                startTime: data.startedAt ? dayjs(data.startedAt) : null,
                startDate: data.startedAt ? dayjs(data.startedAt) : null,
                endTime: data.endedAt ? dayjs(data.endedAt) : null,
                endDate: data.endedAt ? dayjs(data.endedAt) : null,
            })
        }
    }, [data, form])

    const handleSubmit = useCallback(async () => {
        try {
            const values = await form.validateFields()
            const payload = {}

            const combinedStartDate = combineDateTime(values.startDate, values.startTime)
            const combinedEndDate = combineDateTime(values.endDate, values.endTime)

            if (isAdmin) {
                payload.startTime = combinedStartDate
                payload.startDate = combinedStartDate
                payload.isOngoing = values.isOngoing

                if (!values.isOngoing) {
                    payload.endDate = combinedEndDate
                    payload.endTime = combinedEndDate
                } else {
                    payload.endDate = null
                    payload.endTime = null
                }
            } else {
                payload.endTime = combinedEndDate
                payload.endDate = combinedEndDate
            }

            payload.note = values.note

            // **FIX:** Reverted to your original single-log update endpoint
            const response = await irrigationApi.patch(`irrigations/${data._id}`, payload)

            if (response?.error) {
                openNotification('error', 'خطا', response.message)
            } else {
                openNotification('success', 'ویرایش موفق', 'لاگ با موفقیت ویرایش شد.')
                setLogs(prev => prev.map(item => (item._id === data._id ? { ...item, ...response.irrigation } : item)))
                onClose()
            }
        } catch (err) {
            openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
        }
    }, [form, isAdmin, data, irrigationApi, openNotification, setLogs, onClose])

    return (
        <Modal
            title='ویرایش لاگ توزیع'
            open={!!data}
            onOk={handleSubmit}
            onCancel={onClose}
            okText='ثبت تغییرات'
            cancelText='انصراف'
            confirmLoading={irrigationApi.isLoading || landsApi.isLoading}
            destroyOnClose
        >
            <IrrigationLogForm
                page={page}
                mode='edit'
                type={isAdmin ? 'admin' : 'irrigator'}
                form={form}
                lands={landsApi.data?.lands || []}
                // Assuming landGroups are passed from the parent table as they are contextual
                landGroups={data?.landGroups || []}
            />
        </Modal>
    )
}

export default EditIrrigationLog