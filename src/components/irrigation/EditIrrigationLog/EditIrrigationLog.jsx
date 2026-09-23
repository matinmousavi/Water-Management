import { useEffect, useCallback } from 'react'
import { Modal, Form, Spin } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import IrrigationLogForm from '../IrrigationLogForm/IrrigationLogForm'
import dayjs from 'dayjs'
import { useUser } from '../../../contexts/UserContext'

const combineDateTime = (date, time) => {
    if (!date || !time) return date

    const validDate = dayjs(date)
    const validTime = dayjs(time)

    return validDate
        .hour(validTime.hour())
        .minute(validTime.minute())
        .second(0)
        .millisecond(0)
}

const EditIrrigationLog = ({ data, setLogs, onClose, page = 'well' }) => {
    const [form] = Form.useForm()
    const irrigationApi = useAPI()
    const landsApi = useAPI()
    const wellsApi = useAPI()
    const { openNotification } = useNotification()
    const { isAdmin } = useUser()

    useEffect(() => {
        landsApi.init('lands')
        wellsApi.init('wells')
    }, [])

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                ...data,
                landId: data.landGroup
                    ? `group-${data.landGroup}`
                    : data.land?._id || data.land,
                wellId: data.well?._id || data.well,
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

            const combinedStartDate = combineDateTime(
                values.startDate,
                values.startTime
            )

            const combinedEndDate = combineDateTime(
                values.endDate,
                values.endTime
            )

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

            const response = await irrigationApi.patch(
                `irrigations/${data._id}`,
                payload
            )

            if (response?.error) {
                openNotification('error', 'خطا', response.message)
            } else {
                openNotification(
                    'success',
                    'ویرایش موفق',
                    'لاگ با موفقیت ویرایش شد.'
                )

                setLogs(prev =>
                    prev.map(item =>
                        item._id === data._id
                            ? { ...item, ...response.irrigation }
                            : item
                    )
                )

                onClose()
            }
        } catch (err) {
            openNotification(
                'error',
                'خطا',
                err?.error?.message || 'خطایی رخ داده است'
            )
        }
    }, [
        form,
        isAdmin,
        data,
        irrigationApi,
        openNotification,
        setLogs,
        onClose,
    ])

    const wells = wellsApi.data?.wells || []

    const wellId = data?.well?._id || data?.well

    const defaultWell =
        wells.find(well => well._id === wellId) ||
        (typeof data?.well === 'object' ? data.well : null) ||
        data?.land?.wells?.[0] ||
        null

    const isLoadingData = wellsApi.isLoading || landsApi.isLoading

    return (
        <Modal
            title='ویرایش لاگ توزیع'
            open={!!data}
            onOk={handleSubmit}
            onCancel={onClose}
            okText='ثبت تغییرات'
            cancelText='انصراف'
            confirmLoading={
                irrigationApi.isLoading ||
                landsApi.isLoading ||
                wellsApi.isLoading
            }
            destroyOnClose
        >
            {isLoadingData ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 250,
                    }}
                >
                    <Spin size='large' />
                </div>
            ) : (
                <IrrigationLogForm
                    page={page}
                    mode='edit'
                    type={isAdmin ? 'admin' : 'irrigator'}
                    form={form}
                    lands={landsApi.data?.lands || []}
                    landGroups={data?.landGroups || []}
                    defaultWell={defaultWell}
                    allWells={wells}
                />
            )}
        </Modal>
    )
}

export default EditIrrigationLog