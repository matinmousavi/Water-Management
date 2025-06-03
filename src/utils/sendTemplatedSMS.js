
import MessageTemplate from '../models/MessageTemplate.js'
import { renderTemplate } from '../utils/renderTemplate.js'
import sendSMS from '../services/sendSMS.js'

export async function sendTemplatedSMS({ to, key, variables = {} }) {
  const template = await MessageTemplate.findOne({ key })

  if (!template) {
    throw new Error(`پیام با کلید '${key}' یافت نشد.`)
  }


  const message = renderTemplate(template.text, variables)

  return sendSMS({ to, message })
}
